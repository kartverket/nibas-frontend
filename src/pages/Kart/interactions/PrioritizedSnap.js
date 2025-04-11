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
    let closestFeature;
    let closestSegment = null;

    const squaredPixelTolerance = this.pixelTolerance_ * this.pixelTolerance_;
    const getResult = () => {
      if (closestVertex != null) {
        const vertexPixel = map.getPixelFromCoordinate(closestVertex);
        const squaredPixelDistance = squaredDistance(pixel, vertexPixel);
        if (squaredPixelDistance <= squaredPixelTolerance) {
          return {
            vertex: closestVertex,
            vertexPixel: [Math.round(vertexPixel[0]), Math.round(vertexPixel[1])],
            feature: closestFeature,
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
          segmentData.segment.forEach((vertex) => {
            const tempVertexCoord = fromUserCoordinate(vertex, projection);
            const delta = squaredDistance(projectedCoordinate, tempVertexCoord);
            if (delta < minSquaredDistance) {
              closestVertex = vertex;
              minSquaredDistance = delta;
              closestFeature = segmentData.feature;
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
