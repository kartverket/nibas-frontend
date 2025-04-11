import { closestOnCircle, closestOnSegment, squaredDistance } from "ol/coordinate";
import { boundingExtent, buffer } from "ol/extent";
import { Snap } from "ol/interaction";
import { fromUserCoordinate, getUserProjection, toUserCoordinate, toUserExtent } from "ol/proj";

const tempSegment = [];

export class PrioritizedSnap extends Snap {
  constructor(options) {
    super(options);
  }

  snapTo(pixel, pixelCoordinate, map) {
    const projection = map.getView().getProjection();
    const projectedCoordinate = fromUserCoordinate(pixelCoordinate, projection);

    const box = toUserExtent(
      buffer(boundingExtent([projectedCoordinate]), map.getView().getResolution() * this.pixelTolerance_),
      projection,
    );

    const segments = this.rBush_.getInExtent(box);
    const segmentsLength = segments.length;
    if (segmentsLength === 0) {
      return null;
    }

    let closestVertex;
    let minSquaredDistance = Infinity;
    let closestEndpointVertex;
    let minSquaredEndpointDistance = Infinity;

    let closestFeature;
    let closestEndpointFeature;
    let closestSegment = null;

    const squaredPixelTolerance = this.pixelTolerance_ * this.pixelTolerance_;
    const getResult = () => {
      if (closestVertex != null || closestEndpointVertex != null) {
        const vertexPixel = closestVertex != null ? map.getPixelFromCoordinate(closestVertex) : null;
        const squaredPixelDistance = vertexPixel != null ? squaredDistance(pixel, vertexPixel) : Infinity;

        const endpointVertexPixel =
          closestEndpointVertex != null ? map.getPixelFromCoordinate(closestEndpointVertex) : null;
        const endpointSquaredPixelDistance =
          endpointVertexPixel != null ? squaredDistance(pixel, endpointVertexPixel) : Infinity;
        if (squaredPixelDistance <= squaredPixelTolerance || endpointSquaredPixelDistance <= squaredPixelTolerance) {
          return {
            // Vi prioriterer det nærmeste endepunktet hvis det eksisterer
            vertex: closestEndpointVertex ?? closestVertex,
            vertexPixel:
              closestEndpointVertex != null
                ? [Math.round(endpointVertexPixel[0]), Math.round(endpointVertexPixel[1])]
                : [Math.round(vertexPixel[0]), Math.round(vertexPixel[1])],
            feature: closestEndpointFeature ?? closestFeature,
            segment: closestSegment,
          };
        }
      }
      return null;
    };

    if (this.vertex_ != null) {
      for (let i = 0; i < segmentsLength; ++i) {
        const segmentData = segments[i];
        if (segmentData.feature.getGeometry().getType() !== "Circle") {
          const coords = segmentData.feature.getGeometry().getCoordinates();

          segmentData.segment.forEach((vertex) => {
            const isEndpoint =
              (coords.length >= 2 && vertex[0] === coords[0][0] && vertex[1] === coords[0][1]) ||
              (vertex[0] === coords[coords.length - 1][0] && vertex[1] === coords[coords.length - 1][1]);

            const tempVertexCoord = fromUserCoordinate(vertex, projection);
            const delta = squaredDistance(projectedCoordinate, tempVertexCoord);
            if (delta < minSquaredDistance && !isEndpoint) {
              closestVertex = vertex;
              minSquaredDistance = delta;
              closestFeature = segmentData.feature;
            } else if (delta < minSquaredEndpointDistance && isEndpoint) {
              closestEndpointVertex = vertex;
              minSquaredEndpointDistance = delta;
              closestEndpointFeature = segmentData.feature;
            }
          });
        }
      }
      const result = getResult();
      if (result) {
        return result;
      }
    }

    if (this.edge_ != null) {
      for (let i = 0; i < segmentsLength; ++i) {
        let vertex = null;
        const segmentData = segments[i];
        if (segmentData.feature.getGeometry().getType() === "Circle") {
          let circleGeometry = segmentData.feature.getGeometry();
          const userProjection = getUserProjection();
          if (userProjection) {
            circleGeometry = circleGeometry.clone().transform(userProjection, projection);
          }
          vertex = closestOnCircle(
            projectedCoordinate,
            /** @type {import("../geom/Circle.js").default} */ (circleGeometry),
          );
        } else {
          const [segmentStart, segmentEnd] = segmentData.segment;
          // points have only one coordinate
          if (segmentEnd != null) {
            tempSegment[0] = fromUserCoordinate(segmentStart, projection);
            tempSegment[1] = fromUserCoordinate(segmentEnd, projection);
            vertex = closestOnSegment(projectedCoordinate, tempSegment);
          }
        }
        if (vertex) {
          const delta = squaredDistance(projectedCoordinate, vertex);
          if (delta < minSquaredDistance) {
            closestVertex = toUserCoordinate(vertex, projection);
            closestSegment = segmentData.feature.getGeometry().getType() === "Circle" ? null : segmentData.segment;
            minSquaredDistance = delta;
            closestFeature = segmentData.feature;
          }
        }
      }

      const result = getResult();
      if (result) {
        return result;
      }
    }

    return null;
  }
}
