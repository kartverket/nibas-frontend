import { rest } from "msw";
import type { RestHandler } from "msw";

const getFailingRequests = () => {
  const requestUrls = [
    "https://openwms.statkart.no/skwms1/wms.topo4",
    "https://openwms.statkart.no/skwms1/wms.stedsnavnenkel",
    "https://openwms.statkart.no/skwms1/wms.grunnkretser",
    "https://wms.geonorge.no/skwms1/wms.adm_enheter_historisk",
    "https://openwms.statkart.no/skwms1/wms.n5raster2",
    "https://openwms.statkart.no/skwms1/wms.kartblad",
    "https://openwms.statkart.no/skwms1/wms.nmg",
    "https://wms.geonorge.no/skwms1/wms.dybdedata2",
    "https://openwms.statkart.no/skwms1/wms.toporaster4",
    "https://openwms.statkart.no/skwms1/wms.ssr2",
    "https://wms.geonorge.no/skwms1/wms.historiskekart",
    "https://openwms.statkart.no/skwms1/wms.grunnkretser",
    "https://openwms.statkart.no/skwms1/wms.topo4.graatone",
    "https://opencache.statkart.no/gatekeeper/gk/gk.open_wmts",
  ];

  return requestUrls.map((url) =>
    rest.get(url, (req, res, ctx) => res(ctx.status(501)))
  );
};

export const geonorgeHandlers: RestHandler[] = [
  // vi mocker alle requests til WMS servere
  ...getFailingRequests(),
  rest.get(
    "https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2",
    (req, res, ctx) => {
      if (
        req.url.searchParams.get("service")?.toLowerCase() !== "wmts" ||
        req.url.searchParams.get("request")?.toLowerCase() !== "getcapabilities"
      )
        return res(ctx.status(501));

      return res(
        ctx.status(200),
        ctx.xml(`<?xml version="1.0" encoding="UTF-8"?>
    <Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd" version="1.0.0">
      <!-- Service Identification --> 
     <ows:ServiceIdentification>
      <ows:Title>Nibcache_UTM33_EUREF89_v2</ows:Title>
      <ows:ServiceType>OGC WMTS</ows:ServiceType>
      <ows:ServiceTypeVersion>1.0.0</ows:ServiceTypeVersion>
    </ows:ServiceIdentification> <!-- Operations Metadata --> <ows:OperationsMetadata>
      <ows:Operation name="GetCapabilities">
        <ows:DCP>
          <ows:HTTP>
            <ows:Get xlink:href="http://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2?request=GetCapabilities&amp;service=WMTS">
              <ows:Constraint name="GetEncoding">
                <ows:AllowedValues>
                  <ows:Value>KVP</ows:Value>
                </ows:AllowedValues>
              </ows:Constraint>
            </ows:Get>
                    <!-- add KVP binding in 10.1 -->
                    <ows:Get xlink:href="http://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2?">
                      <ows:Constraint name="GetEncoding">
                        <ows:AllowedValues>
                          <ows:Value>KVP</ows:Value>
                        </ows:AllowedValues>
                      </ows:Constraint>
                    </ows:Get>
            </ows:HTTP>
        </ows:DCP>
      </ows:Operation>
      <ows:Operation name="GetTile">
        <ows:DCP>
          <ows:HTTP>
            <ows:Get xlink:href="http://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2?">
              <ows:Constraint name="GetEncoding">
                <ows:AllowedValues>
                  <ows:Value>KVP</ows:Value>
                </ows:AllowedValues>
              </ows:Constraint>
            </ows:Get>
                    <ows:Get xlink:href="http://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2?">
                      <ows:Constraint name="GetEncoding">
                        <ows:AllowedValues>
                          <ows:Value>KVP</ows:Value>
                        </ows:AllowedValues>
                      </ows:Constraint>
                    </ows:Get>
                </ows:HTTP>
        </ows:DCP>
      </ows:Operation>
    </ows:OperationsMetadata> 
    <Contents>
      <!--Layer-->  
      <Layer>
        <ows:Title>Nibcache_UTM33_EUREF89_v2</ows:Title> 
        <ows:Identifier>Nibcache_UTM33_EUREF89_v2</ows:Identifier>
        <ows:BoundingBox crs="urn:ogc:def:crs:EPSG::25833">
        <ows:LowerCorner>-2500000.0 3500000.0</ows:LowerCorner>
          <ows:UpperCorner>3045984.0 9045984.0</ows:UpperCorner>
        </ows:BoundingBox>  
          <ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
          <ows:LowerCorner>-29.999990555234554 28.11050192536871</ows:LowerCorner>
          <ows:UpperCorner>59.999992213400155 81.47283804206918</ows:UpperCorner>
        </ows:WGS84BoundingBox>
        <Style isDefault="true">
          <ows:Title>Default Style</ows:Title>
          <ows:Identifier>default</ows:Identifier>
        </Style>
        <Format>image/jpgpng</Format>
        <TileMatrixSetLink>
          <TileMatrixSet>default028mm</TileMatrixSet>
        </TileMatrixSetLink>
    
          <ResourceURL format="image/jpgpng" resourceType="tile" template="https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2?Nibcache_UTM33_EUREF89_v2/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}" />
      </Layer> 
       <!--TileMatrixSet-->
       <TileMatrixSet>
         <ows:Title>TileMatrix using 0.28mm</ows:Title>
         <ows:Abstract>The tile matrix set that has scale values calculated based on the dpi defined by OGC specification (dpi assumes 0.28mm as the physical distance of a pixel).</ows:Abstract> 
         <ows:Identifier>default028mm</ows:Identifier>
         <ows:SupportedCRS>urn:ogc:def:crs:EPSG::25833</ows:SupportedCRS>
          <TileMatrix>
              <ows:Identifier>0</ows:Identifier>
              <ScaleDenominator>7.737142857141884E7</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>2</MatrixWidth> 
                <MatrixHeight>2</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>1</ows:Identifier>
              <ScaleDenominator>3.868571428570942E7</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>3</MatrixWidth> 
                <MatrixHeight>3</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>2</ows:Identifier>
              <ScaleDenominator>1.934285714285471E7</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>5</MatrixWidth> 
                <MatrixHeight>5</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>3</ows:Identifier>
              <ScaleDenominator>9671428.571427355</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>9</MatrixWidth> 
                <MatrixHeight>9</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>4</ows:Identifier>
              <ScaleDenominator>4835714.285713677</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>17</MatrixWidth> 
                <MatrixHeight>17</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>5</ows:Identifier>
              <ScaleDenominator>2417857.1428568386</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>33</MatrixWidth> 
                <MatrixHeight>33</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>6</ows:Identifier>
              <ScaleDenominator>1208928.5714284193</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>65</MatrixWidth> 
                <MatrixHeight>65</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>7</ows:Identifier>
              <ScaleDenominator>604464.2857142097</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>129</MatrixWidth> 
                <MatrixHeight>129</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>8</ows:Identifier>
              <ScaleDenominator>302232.14285710483</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>257</MatrixWidth> 
                <MatrixHeight>257</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>9</ows:Identifier>
              <ScaleDenominator>151116.07142855242</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>513</MatrixWidth> 
                <MatrixHeight>513</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>10</ows:Identifier>
              <ScaleDenominator>75558.03571427621</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>1025</MatrixWidth> 
                <MatrixHeight>1025</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>11</ows:Identifier>
              <ScaleDenominator>37779.017857138104</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>2049</MatrixWidth> 
                <MatrixHeight>2049</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>12</ows:Identifier>
              <ScaleDenominator>18889.508928569052</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>4097</MatrixWidth> 
                <MatrixHeight>4097</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>13</ows:Identifier>
              <ScaleDenominator>9444.754464284526</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>8193</MatrixWidth> 
                <MatrixHeight>8193</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>14</ows:Identifier>
              <ScaleDenominator>4722.377232142263</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>16385</MatrixWidth> 
                <MatrixHeight>16385</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>15</ows:Identifier>
              <ScaleDenominator>2361.1886160711315</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>32769</MatrixWidth> 
                <MatrixHeight>32769</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>16</ows:Identifier>
              <ScaleDenominator>1180.5943080355657</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>65537</MatrixWidth> 
                <MatrixHeight>65537</MatrixHeight>
              </TileMatrix>
              <TileMatrix>
              <ows:Identifier>17</ows:Identifier>
              <ScaleDenominator>590.2971540177829</ScaleDenominator>
              <TopLeftCorner>-2500000.0 9045984.0</TopLeftCorner>  
              <TileWidth>256</TileWidth> 
              <TileHeight>256</TileHeight>
              <MatrixWidth>131073</MatrixWidth> 
                <MatrixHeight>131073</MatrixHeight>
              </TileMatrix>
              </TileMatrixSet>
       </Contents>
    <ServiceMetadataURL xlink:href="https://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2?request=GetCapabilities&amp;service=WMTS" /> 
    </Capabilities>
    `)
      );
    }
  ),
  rest.get(
    "https://wms.geonorge.no/skwms1/wms.adm_enheter2",
    (req, res, ctx) => {
      if (
        req.url.searchParams.get("service")?.toLowerCase() !== "wms" ||
        req.url.searchParams.get("request")?.toLowerCase() !== "getcapabilities"
      )
        return res(ctx.status(501));

      return res(
        ctx.status(200),
        ctx.xml(`<?xml version="1.0" encoding="UTF-8"?>
    <WMS_Capabilities xmlns="http://www.opengis.net/wms" xmlns:sld="http://www.opengis.net/sld" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ms="http://mapserver.gis.umn.edu/mapserver" xmlns:inspire_common="http://inspire.ec.europa.eu/schemas/common/1.0" xmlns:inspire_vs="http://inspire.ec.europa.eu/schemas/inspire_vs/1.0" version="1.3.0" xsi:schemaLocation="http://www.opengis.net/wms http://schemas.opengis.net/wms/1.3.0/capabilities_1_3_0.xsd  http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/sld_capabilities.xsd  http://inspire.ec.europa.eu/schemas/inspire_vs/1.0  http://inspire.ec.europa.eu/schemas/inspire_vs/1.0/inspire_vs.xsd http://mapserver.gis.umn.edu/mapserver https://wms.geonorge.no:80/cgi-bin/adm_enheter2?language=nor&amp;service=WMS&amp;version=1.3.0&amp;request=GetSchemaExtension">
    
    <!-- MapServer version 7.4.2 OUTPUT=PNG OUTPUT=JPEG SUPPORTS=PROJ SUPPORTS=AGG SUPPORTS=FREETYPE SUPPORTS=CAIRO SUPPORTS=SVG_SYMBOLS SUPPORTS=RSVG SUPPORTS=ICONV SUPPORTS=FRIBIDI SUPPORTS=WMS_SERVER SUPPORTS=WMS_CLIENT SUPPORTS=WFS_SERVER SUPPORTS=WFS_CLIENT SUPPORTS=WCS_SERVER SUPPORTS=SOS_SERVER SUPPORTS=FASTCGI SUPPORTS=GEOS SUPPORTS=PBF INPUT=JPEG INPUT=POSTGIS INPUT=OGR INPUT=GDAL INPUT=SHAPEFILE -->
    
    <Service>
      <Name>WMS</Name>
      <Title>Administrative enheter WMS versjon 2</Title>
      <Abstract>WMS-tjeneste over fylker og kommuner. Inneholder bl.a. riksgrense, territorialgrense, fylkesgrense og kommunegrense for gjeldene, fremtidige og historiske data.</Abstract>
      <KeywordList>
          <Keyword>Grenser</Keyword>
          <Keyword> Riksgrense</Keyword>
          <Keyword> Territorialgrense</Keyword>
          <Keyword> Fylkesgrense</Keyword>
          <Keyword> Kommunegrense</Keyword>
      </KeywordList>
      <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?" />
      <ContactInformation>
        <ContactPersonPrimary>
          <ContactPerson>I5 Geodatatjenester</ContactPerson>
          <ContactOrganization>Kartverket</ContactOrganization>
        </ContactPersonPrimary>
          <ContactPosition>WMS ansvarlig</ContactPosition>
        <ContactAddress>
            <AddressType>Postal address</AddressType>
            <Address>Statens kartverk</Address>
            <City>Hønefoss</City>
            <StateOrProvince>Buskerud</StateOrProvince>
            <PostCode>3507</PostCode>
            <Country>Norway</Country>
        </ContactAddress>
          <ContactVoiceTelephone>+ 47 32 11 81 41</ContactVoiceTelephone>
      <ContactElectronicMailAddress>tjenestedrift@kartverket.no</ContactElectronicMailAddress>
      </ContactInformation>
      <Fees>None</Fees>
      <AccessConstraints>None</AccessConstraints>
      <MaxWidth>8192</MaxWidth>
      <MaxHeight>8192</MaxHeight>
    </Service>
    
    <Capability>
      <Request>
        <GetCapabilities>
          <Format>text/xml</Format>
          <DCPType>
            <HTTP>
              <Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?" /></Get>
              <Post><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?" /></Post>
            </HTTP>
          </DCPType>
        </GetCapabilities>
        <GetMap>
          <Format>image/png</Format>
          <Format>image/png; mode=8bit</Format>
          <Format>image/png8</Format>
          <Format>image/jpeg</Format>
          <DCPType>
            <HTTP>
              <Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?" /></Get>
              <Post><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?" /></Post>
            </HTTP>
          </DCPType>
        </GetMap>
        <GetFeatureInfo>
          <Format>text/html</Format>
          <Format>application/vnd.ogc.gml</Format>
          <Format>text/plain</Format>
          <DCPType>
            <HTTP>
              <Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?" /></Get>
              <Post><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?" /></Post>
            </HTTP>
          </DCPType>
        </GetFeatureInfo>
        <sld:DescribeLayer>
          <Format>text/xml</Format>
          <DCPType>
            <HTTP>
              <Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?" /></Get>
              <Post><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?" /></Post>
            </HTTP>
          </DCPType>
        </sld:DescribeLayer>
        <sld:GetLegendGraphic>
          <Format>image/png; mode=8bit</Format>
          <Format>image/png8</Format>
          <Format>image/png</Format>
          <Format>image/jpeg</Format>
          <Format>image/vnd.jpeg-png</Format>
          <Format>image/vnd.jpeg-png8</Format>
          <DCPType>
            <HTTP>
              <Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?" /></Get>
              <Post><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?" /></Post>
            </HTTP>
          </DCPType>
        </sld:GetLegendGraphic>
      </Request>
      <Exception>
        <Format>XML</Format>
        <Format>INIMAGE</Format>
        <Format>BLANK</Format>
      </Exception>
      <sld:UserDefinedSymbolization SupportSLD="1" UserLayer="0" UserStyle="1" RemoteWFS="0" InlineFeature="0" RemoteWCS="0" />
      <inspire_vs:ExtendedCapabilities>
        <inspire_common:MetadataUrl xsi:type="inspire_common:resourceLocatorType">
          <inspire_common:URL>https://www.geonorge.no/geonetwork/srv/nor/xml_iso19139?uuid=2277a770-56f4-4e58-913b-0ae463700bb8</inspire_common:URL>
          <inspire_common:MediaType>text/xml</inspire_common:MediaType>
        </inspire_common:MetadataUrl>
        <inspire_common:SupportedLanguages>
          <inspire_common:DefaultLanguage><inspire_common:Language>nor</inspire_common:Language></inspire_common:DefaultLanguage>
        </inspire_common:SupportedLanguages>
        <inspire_common:ResponseLanguage><inspire_common:Language>nor</inspire_common:Language></inspire_common:ResponseLanguage>
      </inspire_vs:ExtendedCapabilities>
      <Layer queryable="1">
        <Name>adm_enheter_V2_WMS</Name>
        <Title>Administrative enheter WMS versjon 2</Title>
        <Abstract>WMS-tjeneste over fylker og kommuner. Inneholder bl.a. riksgrense, territorialgrense, fylkesgrense og kommunegrense for gjeldene, fremtidige og historiske data.</Abstract>
        <KeywordList>
            <Keyword>Grenser</Keyword>
            <Keyword> Riksgrense</Keyword>
            <Keyword> Territorialgrense</Keyword>
            <Keyword> Fylkesgrense</Keyword>
            <Keyword> Kommunegrense</Keyword>
        </KeywordList>
        <CRS>EPSG:25829</CRS>
        <CRS>EPSG:25830</CRS>
        <CRS>EPSG:25831</CRS>
        <CRS>EPSG:25832</CRS>
        <CRS>EPSG:900913</CRS>
        <CRS>EPSG:3857</CRS>
        <CRS>EPSG:25833</CRS>
        <CRS>EPSG:25834</CRS>
        <CRS>EPSG:25835</CRS>
        <CRS>EPSG:25836</CRS>
        <CRS>EPSG:900913</CRS>
        <CRS>EPSG:4326</CRS>
        <CRS>EPSG:3006</CRS>
        <CRS>EPSG:27391</CRS>
        <CRS>EPSG:27392</CRS>
        <CRS>EPSG:27393</CRS>
        <CRS>EPSG:27394</CRS>
        <CRS>EPSG:27395</CRS>
        <CRS>EPSG:27396</CRS>
        <CRS>EPSG:27397</CRS>
        <CRS>EPSG:27398</CRS>
        <CRS>EPSG:3034</CRS>
        <CRS>EPSG:32636</CRS>
        <CRS>EPSG:32635</CRS>
        <CRS>EPSG:32633</CRS>
        <CRS>EPSG:32634</CRS>
        <CRS>EPSG:32631</CRS>
        <CRS>EPSG:32632</CRS>
        <CRS>EPSG:4258</CRS>
        <EX_GeographicBoundingBox>
            <westBoundLongitude>-7.04219</westBoundLongitude>
            <eastBoundLongitude>37.4864</eastBoundLongitude>
            <southBoundLatitude>56.4897</southBoundLatitude>
            <northBoundLatitude>72.2495</northBoundLatitude>
        </EX_GeographicBoundingBox>
        <BoundingBox CRS="EPSG:25829" minx="571321" miny="6.31979e+06" maxx="2.71352e+06" maxy="8.50049e+06" />
        <BoundingBox CRS="EPSG:25830" minx="352820" miny="6.27579e+06" maxx="2.37535e+06" maxy="8.35036e+06" />
        <BoundingBox CRS="EPSG:25831" minx="135591" miny="6.26418e+06" maxx="2.02595e+06" maxy="8.21912e+06" />
        <BoundingBox CRS="EPSG:25832" minx="-78460.1" miny="6.28483e+06" maxx="1.66831e+06" maxy="8.10769e+06" />
        <BoundingBox CRS="EPSG:900913" minx="-783933" miny="7.65652e+06" maxx="4.17297e+06" maxy="1.18437e+07" />
        <BoundingBox CRS="EPSG:3857" minx="-783933" miny="7.65652e+06" maxx="4.17297e+06" maxy="1.18437e+07" />
        <BoundingBox CRS="EPSG:25833" minx="-287395" miny="6.33795e+06" maxx="1.30491e+06" maxy="8.01677e+06" />
        <BoundingBox CRS="EPSG:25834" minx="-650713" miny="6.2833e+06" maxx="1.09582e+06" maxy="8.10592e+06" />
        <BoundingBox CRS="EPSG:25835" minx="-1.00837e+06" miny="6.26114e+06" maxx="881471" maxy="8.21556e+06" />
        <BoundingBox CRS="EPSG:25836" minx="-1.3579e+06" miny="6.27127e+06" maxx="663793" maxy="8.34501e+06" />
        <BoundingBox CRS="EPSG:900913" minx="-783933" miny="7.65652e+06" maxx="4.17297e+06" maxy="1.18437e+07" />
        <BoundingBox CRS="EPSG:4326" minx="56.4897" miny="-7.04219" maxx="72.2495" maxy="37.4864" />
        <BoundingBox CRS="EPSG:3006" minx="6.33795e+06" miny="-287395" maxx="8.01677e+06" maxy="1.30491e+06" />
        <BoundingBox CRS="EPSG:27391" minx="-158204" miny="-473913" maxx="1.73174e+06" maxy="1.34542e+06" />
        <BoundingBox CRS="EPSG:27392" minx="-147616" miny="-556860" maxx="1.68998e+06" maxy="1.20574e+06" />
        <BoundingBox CRS="EPSG:27393" minx="-132125" miny="-639065" maxx="1.65131e+06" maxy="1.06514e+06" />
        <BoundingBox CRS="EPSG:27394" minx="-110064" miny="-726185" maxx="1.61336e+06" maxy="913658" />
        <BoundingBox CRS="EPSG:27395" minx="-111672" miny="-902350" maxx="1.61438e+06" maxy="740319" />
        <BoundingBox CRS="EPSG:27396" minx="-144900" miny="-1.1442e+06" maxx="1.67588e+06" maxy="600256" />
        <BoundingBox CRS="EPSG:27397" minx="-163688" miny="-1.38357e+06" maxx="1.74649e+06" maxy="457833" />
        <BoundingBox CRS="EPSG:27398" minx="-167984" miny="-1.6295e+06" maxx="1.82953e+06" maxy="307591" />
        <BoundingBox CRS="EPSG:3034" minx="3.31158e+06" miny="3.35772e+06" maxx="5.07776e+06" maxy="5.07234e+06" />
        <BoundingBox CRS="EPSG:32636" minx="-1.3579e+06" miny="6.27127e+06" maxx="663793" maxy="8.34501e+06" />
        <BoundingBox CRS="EPSG:32635" minx="-1.00837e+06" miny="6.26114e+06" maxx="881471" maxy="8.21556e+06" />
        <BoundingBox CRS="EPSG:32633" minx="-287395" miny="6.33795e+06" maxx="1.30491e+06" maxy="8.01677e+06" />
        <BoundingBox CRS="EPSG:32634" minx="-650713" miny="6.2833e+06" maxx="1.09582e+06" maxy="8.10592e+06" />
        <BoundingBox CRS="EPSG:32631" minx="135591" miny="6.26418e+06" maxx="2.02595e+06" maxy="8.21912e+06" />
        <BoundingBox CRS="EPSG:32632" minx="-78460.1" miny="6.28483e+06" maxx="1.66831e+06" maxy="8.10769e+06" />
        <BoundingBox CRS="EPSG:4258" minx="56.4897" miny="-7.04219" maxx="72.2495" maxy="37.4864" />
        <Attribution>
            <Title>Kartverket</Title>
            <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?" />
            <LogoURL width="825" height="617">
                 <Format>image/jpeg</Format>
                 <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://kartverket.no/globalassets/logoer/kartverket_staende_web.png" />
              </LogoURL>
        </Attribution>
        <MetadataURL type="iso19115">
          <Format>text/xml</Format>
          <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://www.geonorge.no/geonetwork/srv/nor/xml_iso19139?uuid=666e4559-60bf-4a1d-9e72-c43502a9a58b" />
        </MetadataURL>
        <Style>
           <Name>default</Name>
           <Title>default</Title>
           <LegendURL width="279" height="141">
              <Format>image/png</Format>
              <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?language=nor&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=adm_enheter_V2_WMS&amp;format=image/png&amp;STYLE=default" />
           </LegendURL>
        </Style>
        <Layer queryable="1" opaque="0" cascaded="0">
            <Name>kommuner</Name>
            <Title>Kommuner</Title>
            <EX_GeographicBoundingBox>
                <westBoundLongitude>10.5113</westBoundLongitude>
                <eastBoundLongitude>10.5115</eastBoundLongitude>
                <southBoundLatitude>0.00052095</southBoundLatitude>
                <northBoundLatitude>0.000643847</northBoundLatitude>
            </EX_GeographicBoundingBox>
            <BoundingBox CRS="EPSG:25829" minx="2.71465e+06" miny="61.1145" maxx="2.71468e+06" maxy="75.5321" />
            <BoundingBox CRS="EPSG:25830" minx="2.0177e+06" miny="59.2311" maxx="2.01773e+06" maxy="73.2044" />
            <BoundingBox CRS="EPSG:25831" minx="1.33824e+06" miny="58.0824" maxx="1.33827e+06" maxy="71.7847" />
            <BoundingBox CRS="EPSG:25832" minx="668189" miny="57.6008" maxx="668216" maxy="71.1894" />
            <BoundingBox CRS="EPSG:900913" minx="1.17011e+06" miny="57.9919" maxx="1.17014e+06" maxy="71.6728" />
            <BoundingBox CRS="EPSG:3857" minx="1.17011e+06" miny="57.9919" maxx="1.17014e+06" maxy="71.6728" />
            <BoundingBox CRS="EPSG:25833" minx="4.08752" miny="57.759" maxx="31.7616" maxy="71.3849" />
            <BoundingBox CRS="EPSG:25834" minx="-673749" miny="58.5659" maxx="-673721" maxy="72.3821" />
            <BoundingBox CRS="EPSG:25835" minx="-1.36082e+06" miny="60.0679" maxx="-1.3608e+06" maxy="74.2385" />
            <BoundingBox CRS="EPSG:25836" minx="-2.06976e+06" miny="62.3557" maxx="-2.06973e+06" maxy="77.0661" />
            <BoundingBox CRS="EPSG:900913" minx="1.17011e+06" miny="57.9919" maxx="1.17014e+06" maxy="71.6728" />
            <BoundingBox CRS="EPSG:4326" minx="0.00052095" miny="10.5113" maxx="0.000643847" maxy="10.5115" />
            <BoundingBox CRS="EPSG:3006" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <BoundingBox CRS="EPSG:27391" minx="-6.43117e+06" miny="496551" maxx="-6.43116e+06" maxy="496579" />
            <BoundingBox CRS="EPSG:27392" minx="-6.43117e+06" miny="236382" maxx="-6.43115e+06" maxy="236410" />
            <BoundingBox CRS="EPSG:27393" minx="-6.43117e+06" miny="-23391.8" maxx="-6.43115e+06" maxy="-23364.2" />
            <BoundingBox CRS="EPSG:27394" minx="-6.43117e+06" miny="-301776" maxx="-6.43115e+06" maxy="-301748" />
            <BoundingBox CRS="EPSG:27395" minx="-6.43117e+06" miny="-711272" maxx="-6.43116e+06" maxy="-711245" />
            <BoundingBox CRS="EPSG:27396" minx="-6.43118e+06" miny="-1.16144e+06" maxx="-6.43116e+06" maxy="-1.16141e+06" />
            <BoundingBox CRS="EPSG:27397" minx="-6.43118e+06" miny="-1.61744e+06" maxx="-6.43117e+06" maxy="-1.61741e+06" />
            <BoundingBox CRS="EPSG:27398" minx="-6.43119e+06" miny="-2.10131e+06" maxx="-6.43118e+06" maxy="-2.10128e+06" />
            <BoundingBox CRS="EPSG:3034" minx="-3.45572e+06" miny="4.0772e+06" maxx="-3.45571e+06" maxy="4.07724e+06" />
            <BoundingBox CRS="EPSG:32636" minx="-2.06976e+06" miny="62.3557" maxx="-2.06973e+06" maxy="77.0661" />
            <BoundingBox CRS="EPSG:32635" minx="-1.36082e+06" miny="60.0679" maxx="-1.3608e+06" maxy="74.2385" />
            <BoundingBox CRS="EPSG:32633" minx="4.08752" miny="57.759" maxx="31.7616" maxy="71.3849" />
            <BoundingBox CRS="EPSG:32634" minx="-673749" miny="58.5659" maxx="-673721" maxy="72.3821" />
            <BoundingBox CRS="EPSG:32631" minx="1.33824e+06" miny="58.0824" maxx="1.33827e+06" maxy="71.7847" />
            <BoundingBox CRS="EPSG:32632" minx="668189" miny="57.6008" maxx="668216" maxy="71.1894" />
            <BoundingBox CRS="EPSG:4258" minx="0.00052095" miny="10.5113" maxx="0.000643847" maxy="10.5115" />
            <Identifier authority="Geonorge">kommuner</Identifier>
            <MetadataURL type="TC211">
              <Format>text/xml</Format>
              <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://www.geonorge.no/geonetwork/srv/nor/xml_iso19139?uuid=041f1e6e-bdbc-4091-b48f-8a5990f3cc5b" />
            </MetadataURL>
          <Layer queryable="1" opaque="0" cascaded="0">
            <Name>kommuner_hist</Name>
            <Title>Kommuner historisk</Title>
            <CRS>EPSG:4258</CRS>
            <EX_GeographicBoundingBox>
                <westBoundLongitude>4.08752</westBoundLongitude>
                <eastBoundLongitude>31.7616</eastBoundLongitude>
                <southBoundLatitude>57.759</southBoundLatitude>
                <northBoundLatitude>71.3849</northBoundLatitude>
            </EX_GeographicBoundingBox>
            <BoundingBox CRS="EPSG:25829" minx="963037" miny="6.47734e+06" maxx="2.82329e+06" maxy="8.40056e+06" />
            <BoundingBox CRS="EPSG:25830" minx="751996" miny="6.42396e+06" maxx="2.50747e+06" maxy="8.27162e+06" />
            <BoundingBox CRS="EPSG:25831" minx="538744" miny="6.4024e+06" maxx="2.17805e+06" maxy="8.16191e+06" />
            <BoundingBox CRS="EPSG:25832" minx="207834" miny="6.40188e+06" maxx="1.83834e+06" maxy="8.07215e+06" />
            <BoundingBox CRS="EPSG:900913" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:3857" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:25833" minx="-147647" miny="6.40189e+06" maxx="1.49112e+06" maxy="8.00287e+06" />
            <BoundingBox CRS="EPSG:25834" minx="-499926" miny="6.40188e+06" maxx="1.13874e+06" maxy="8.00436e+06" />
            <BoundingBox CRS="EPSG:25835" minx="-846986" miny="6.40188e+06" maxx="783202" maxy="8.07416e+06" />
            <BoundingBox CRS="EPSG:25836" minx="-1.18647e+06" miny="6.40255e+06" maxx="455882" maxy="8.16443e+06" />
            <BoundingBox CRS="EPSG:900913" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:4326" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <BoundingBox CRS="EPSG:3006" minx="6.40189e+06" miny="-147647" maxx="8.00287e+06" maxy="1.49112e+06" />
            <BoundingBox CRS="EPSG:27391" minx="-26932.3" miny="-116936" maxx="1.68554e+06" maxy="1.50696e+06" />
            <BoundingBox CRS="EPSG:27392" minx="-26933.6" miny="-255733" maxx="1.65221e+06" maxy="1.37409e+06" />
            <BoundingBox CRS="EPSG:27393" minx="-26948.8" miny="-394346" maxx="1.62198e+06" maxy="1.24006e+06" />
            <BoundingBox CRS="EPSG:27394" minx="-26958" miny="-542540" maxx="1.59304e+06" maxy="1.09532e+06" />
            <BoundingBox CRS="EPSG:27395" minx="-26969.9" miny="-759025" maxx="1.55713e+06" maxy="881250" />
            <BoundingBox CRS="EPSG:27396" minx="-26985.6" miny="-993559" maxx="1.57502e+06" maxy="645827" />
            <BoundingBox CRS="EPSG:27397" minx="-27004.4" miny="-1.2258e+06" maxx="1.619e+06" maxy="408991" />
            <BoundingBox CRS="EPSG:27398" minx="-27022.2" miny="-1.46454e+06" maxx="1.67456e+06" maxy="161365" />
            <BoundingBox CRS="EPSG:3034" minx="3.42094e+06" miny="3.65787e+06" maxx="5.06158e+06" maxy="5.24245e+06" />
            <BoundingBox CRS="EPSG:32636" minx="-1.18647e+06" miny="6.40255e+06" maxx="455882" maxy="8.16443e+06" />
            <BoundingBox CRS="EPSG:32635" minx="-846986" miny="6.40188e+06" maxx="783202" maxy="8.07416e+06" />
            <BoundingBox CRS="EPSG:32633" minx="-147647" miny="6.40189e+06" maxx="1.49112e+06" maxy="8.00287e+06" />
            <BoundingBox CRS="EPSG:32634" minx="-499926" miny="6.40188e+06" maxx="1.13874e+06" maxy="8.00436e+06" />
            <BoundingBox CRS="EPSG:32631" minx="538744" miny="6.4024e+06" maxx="2.17805e+06" maxy="8.16191e+06" />
            <BoundingBox CRS="EPSG:32632" minx="207834" miny="6.40188e+06" maxx="1.83834e+06" maxy="8.07215e+06" />
            <BoundingBox CRS="EPSG:4258" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <Identifier authority="Geonorge">kommuner</Identifier>
            <MetadataURL type="TC211">
              <Format>text/xml</Format>
              <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://www.geonorge.no/geonetwork/srv/nor/xml_iso19139?uuid=041f1e6e-bdbc-4091-b48f-8a5990f3cc5b" />
            </MetadataURL>
            <Style>
              <Name>default</Name>
              <Title>default</Title>
              <LegendURL width="276" height="29">
                 <Format>image/png</Format>
                 <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?language=nor&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=kommuner_hist&amp;format=image/png&amp;STYLE=default" />
              </LegendURL>
            </Style>
          </Layer>
          <Layer queryable="1" opaque="0" cascaded="0">
            <Name>kommuner_gjel</Name>
            <Title>Kommuner gjeldene</Title>
            <CRS>EPSG:4258</CRS>
            <EX_GeographicBoundingBox>
                <westBoundLongitude>4.08752</westBoundLongitude>
                <eastBoundLongitude>31.7616</eastBoundLongitude>
                <southBoundLatitude>57.759</southBoundLatitude>
                <northBoundLatitude>71.3849</northBoundLatitude>
            </EX_GeographicBoundingBox>
            <BoundingBox CRS="EPSG:25829" minx="963037" miny="6.47734e+06" maxx="2.82329e+06" maxy="8.40056e+06" />
            <BoundingBox CRS="EPSG:25830" minx="751996" miny="6.42396e+06" maxx="2.50747e+06" maxy="8.27162e+06" />
            <BoundingBox CRS="EPSG:25831" minx="538744" miny="6.4024e+06" maxx="2.17805e+06" maxy="8.16191e+06" />
            <BoundingBox CRS="EPSG:25832" minx="207834" miny="6.40188e+06" maxx="1.83834e+06" maxy="8.07215e+06" />
            <BoundingBox CRS="EPSG:900913" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:3857" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:25833" minx="-147647" miny="6.40189e+06" maxx="1.49112e+06" maxy="8.00287e+06" />
            <BoundingBox CRS="EPSG:25834" minx="-499926" miny="6.40188e+06" maxx="1.13874e+06" maxy="8.00436e+06" />
            <BoundingBox CRS="EPSG:25835" minx="-846986" miny="6.40188e+06" maxx="783202" maxy="8.07416e+06" />
            <BoundingBox CRS="EPSG:25836" minx="-1.18647e+06" miny="6.40255e+06" maxx="455882" maxy="8.16443e+06" />
            <BoundingBox CRS="EPSG:900913" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:4326" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <BoundingBox CRS="EPSG:3006" minx="6.40189e+06" miny="-147647" maxx="8.00287e+06" maxy="1.49112e+06" />
            <BoundingBox CRS="EPSG:27391" minx="-26932.3" miny="-116936" maxx="1.68554e+06" maxy="1.50696e+06" />
            <BoundingBox CRS="EPSG:27392" minx="-26933.6" miny="-255733" maxx="1.65221e+06" maxy="1.37409e+06" />
            <BoundingBox CRS="EPSG:27393" minx="-26948.8" miny="-394346" maxx="1.62198e+06" maxy="1.24006e+06" />
            <BoundingBox CRS="EPSG:27394" minx="-26958" miny="-542540" maxx="1.59304e+06" maxy="1.09532e+06" />
            <BoundingBox CRS="EPSG:27395" minx="-26969.9" miny="-759025" maxx="1.55713e+06" maxy="881250" />
            <BoundingBox CRS="EPSG:27396" minx="-26985.6" miny="-993559" maxx="1.57502e+06" maxy="645827" />
            <BoundingBox CRS="EPSG:27397" minx="-27004.4" miny="-1.2258e+06" maxx="1.619e+06" maxy="408991" />
            <BoundingBox CRS="EPSG:27398" minx="-27022.2" miny="-1.46454e+06" maxx="1.67456e+06" maxy="161365" />
            <BoundingBox CRS="EPSG:3034" minx="3.42094e+06" miny="3.65787e+06" maxx="5.06158e+06" maxy="5.24245e+06" />
            <BoundingBox CRS="EPSG:32636" minx="-1.18647e+06" miny="6.40255e+06" maxx="455882" maxy="8.16443e+06" />
            <BoundingBox CRS="EPSG:32635" minx="-846986" miny="6.40188e+06" maxx="783202" maxy="8.07416e+06" />
            <BoundingBox CRS="EPSG:32633" minx="-147647" miny="6.40189e+06" maxx="1.49112e+06" maxy="8.00287e+06" />
            <BoundingBox CRS="EPSG:32634" minx="-499926" miny="6.40188e+06" maxx="1.13874e+06" maxy="8.00436e+06" />
            <BoundingBox CRS="EPSG:32631" minx="538744" miny="6.4024e+06" maxx="2.17805e+06" maxy="8.16191e+06" />
            <BoundingBox CRS="EPSG:32632" minx="207834" miny="6.40188e+06" maxx="1.83834e+06" maxy="8.07215e+06" />
            <BoundingBox CRS="EPSG:4258" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <Identifier authority="Geonorge">kommuner</Identifier>
            <MetadataURL type="TC211">
              <Format>text/xml</Format>
              <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://www.geonorge.no/geonetwork/srv/nor/xml_iso19139?uuid=041f1e6e-bdbc-4091-b48f-8a5990f3cc5b" />
            </MetadataURL>
            <Style>
              <Name>default</Name>
              <Title>default</Title>
              <LegendURL width="278" height="29">
                 <Format>image/png</Format>
                 <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?language=nor&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=kommuner_gjel&amp;format=image/png&amp;STYLE=default" />
              </LegendURL>
            </Style>
          </Layer>
          <Layer queryable="1" opaque="0" cascaded="0">
            <Name>kommuner_fram</Name>
            <Title>Kommuner framtidig</Title>
            <CRS>EPSG:4258</CRS>
            <EX_GeographicBoundingBox>
                <westBoundLongitude>4.08752</westBoundLongitude>
                <eastBoundLongitude>31.7616</eastBoundLongitude>
                <southBoundLatitude>57.759</southBoundLatitude>
                <northBoundLatitude>71.3849</northBoundLatitude>
            </EX_GeographicBoundingBox>
            <BoundingBox CRS="EPSG:25829" minx="963037" miny="6.47734e+06" maxx="2.82329e+06" maxy="8.40056e+06" />
            <BoundingBox CRS="EPSG:25830" minx="751996" miny="6.42396e+06" maxx="2.50747e+06" maxy="8.27162e+06" />
            <BoundingBox CRS="EPSG:25831" minx="538744" miny="6.4024e+06" maxx="2.17805e+06" maxy="8.16191e+06" />
            <BoundingBox CRS="EPSG:25832" minx="207834" miny="6.40188e+06" maxx="1.83834e+06" maxy="8.07215e+06" />
            <BoundingBox CRS="EPSG:900913" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:3857" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:25833" minx="-147647" miny="6.40189e+06" maxx="1.49112e+06" maxy="8.00287e+06" />
            <BoundingBox CRS="EPSG:25834" minx="-499926" miny="6.40188e+06" maxx="1.13874e+06" maxy="8.00436e+06" />
            <BoundingBox CRS="EPSG:25835" minx="-846986" miny="6.40188e+06" maxx="783202" maxy="8.07416e+06" />
            <BoundingBox CRS="EPSG:25836" minx="-1.18647e+06" miny="6.40255e+06" maxx="455882" maxy="8.16443e+06" />
            <BoundingBox CRS="EPSG:900913" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:4326" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <BoundingBox CRS="EPSG:3006" minx="6.40189e+06" miny="-147647" maxx="8.00287e+06" maxy="1.49112e+06" />
            <BoundingBox CRS="EPSG:27391" minx="-26932.3" miny="-116936" maxx="1.68554e+06" maxy="1.50696e+06" />
            <BoundingBox CRS="EPSG:27392" minx="-26933.6" miny="-255733" maxx="1.65221e+06" maxy="1.37409e+06" />
            <BoundingBox CRS="EPSG:27393" minx="-26948.8" miny="-394346" maxx="1.62198e+06" maxy="1.24006e+06" />
            <BoundingBox CRS="EPSG:27394" minx="-26958" miny="-542540" maxx="1.59304e+06" maxy="1.09532e+06" />
            <BoundingBox CRS="EPSG:27395" minx="-26969.9" miny="-759025" maxx="1.55713e+06" maxy="881250" />
            <BoundingBox CRS="EPSG:27396" minx="-26985.6" miny="-993559" maxx="1.57502e+06" maxy="645827" />
            <BoundingBox CRS="EPSG:27397" minx="-27004.4" miny="-1.2258e+06" maxx="1.619e+06" maxy="408991" />
            <BoundingBox CRS="EPSG:27398" minx="-27022.2" miny="-1.46454e+06" maxx="1.67456e+06" maxy="161365" />
            <BoundingBox CRS="EPSG:3034" minx="3.42094e+06" miny="3.65787e+06" maxx="5.06158e+06" maxy="5.24245e+06" />
            <BoundingBox CRS="EPSG:32636" minx="-1.18647e+06" miny="6.40255e+06" maxx="455882" maxy="8.16443e+06" />
            <BoundingBox CRS="EPSG:32635" minx="-846986" miny="6.40188e+06" maxx="783202" maxy="8.07416e+06" />
            <BoundingBox CRS="EPSG:32633" minx="-147647" miny="6.40189e+06" maxx="1.49112e+06" maxy="8.00287e+06" />
            <BoundingBox CRS="EPSG:32634" minx="-499926" miny="6.40188e+06" maxx="1.13874e+06" maxy="8.00436e+06" />
            <BoundingBox CRS="EPSG:32631" minx="538744" miny="6.4024e+06" maxx="2.17805e+06" maxy="8.16191e+06" />
            <BoundingBox CRS="EPSG:32632" minx="207834" miny="6.40188e+06" maxx="1.83834e+06" maxy="8.07215e+06" />
            <BoundingBox CRS="EPSG:4258" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <Identifier authority="Geonorge">kommuner</Identifier>
            <MetadataURL type="TC211">
              <Format>text/xml</Format>
              <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://www.geonorge.no/geonetwork/srv/nor/xml_iso19139?uuid=041f1e6e-bdbc-4091-b48f-8a5990f3cc5b" />
            </MetadataURL>
            <Style>
              <Name>default</Name>
              <Title>default</Title>
              <LegendURL width="279" height="30">
                 <Format>image/png</Format>
                 <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?language=nor&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=kommuner_fram&amp;format=image/png&amp;STYLE=default" />
              </LegendURL>
            </Style>
          </Layer>
        </Layer>
        <Layer queryable="1" opaque="0" cascaded="0">
            <Name>fylker</Name>
            <Title>Fylker</Title>
            <EX_GeographicBoundingBox>
                <westBoundLongitude>10.5113</westBoundLongitude>
                <eastBoundLongitude>10.5115</eastBoundLongitude>
                <southBoundLatitude>0.00052095</southBoundLatitude>
                <northBoundLatitude>0.000643847</northBoundLatitude>
            </EX_GeographicBoundingBox>
            <BoundingBox CRS="EPSG:25829" minx="2.71465e+06" miny="61.1145" maxx="2.71468e+06" maxy="75.5321" />
            <BoundingBox CRS="EPSG:25830" minx="2.0177e+06" miny="59.2311" maxx="2.01773e+06" maxy="73.2044" />
            <BoundingBox CRS="EPSG:25831" minx="1.33824e+06" miny="58.0824" maxx="1.33827e+06" maxy="71.7847" />
            <BoundingBox CRS="EPSG:25832" minx="668189" miny="57.6008" maxx="668216" maxy="71.1894" />
            <BoundingBox CRS="EPSG:900913" minx="1.17011e+06" miny="57.9919" maxx="1.17014e+06" maxy="71.6728" />
            <BoundingBox CRS="EPSG:3857" minx="1.17011e+06" miny="57.9919" maxx="1.17014e+06" maxy="71.6728" />
            <BoundingBox CRS="EPSG:25833" minx="4.08752" miny="57.759" maxx="31.7616" maxy="71.3849" />
            <BoundingBox CRS="EPSG:25834" minx="-673749" miny="58.5659" maxx="-673721" maxy="72.3821" />
            <BoundingBox CRS="EPSG:25835" minx="-1.36082e+06" miny="60.0679" maxx="-1.3608e+06" maxy="74.2385" />
            <BoundingBox CRS="EPSG:25836" minx="-2.06976e+06" miny="62.3557" maxx="-2.06973e+06" maxy="77.0661" />
            <BoundingBox CRS="EPSG:900913" minx="1.17011e+06" miny="57.9919" maxx="1.17014e+06" maxy="71.6728" />
            <BoundingBox CRS="EPSG:4326" minx="0.00052095" miny="10.5113" maxx="0.000643847" maxy="10.5115" />
            <BoundingBox CRS="EPSG:3006" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <BoundingBox CRS="EPSG:27391" minx="-6.43117e+06" miny="496551" maxx="-6.43116e+06" maxy="496579" />
            <BoundingBox CRS="EPSG:27392" minx="-6.43117e+06" miny="236382" maxx="-6.43115e+06" maxy="236410" />
            <BoundingBox CRS="EPSG:27393" minx="-6.43117e+06" miny="-23391.8" maxx="-6.43115e+06" maxy="-23364.2" />
            <BoundingBox CRS="EPSG:27394" minx="-6.43117e+06" miny="-301776" maxx="-6.43115e+06" maxy="-301748" />
            <BoundingBox CRS="EPSG:27395" minx="-6.43117e+06" miny="-711272" maxx="-6.43116e+06" maxy="-711245" />
            <BoundingBox CRS="EPSG:27396" minx="-6.43118e+06" miny="-1.16144e+06" maxx="-6.43116e+06" maxy="-1.16141e+06" />
            <BoundingBox CRS="EPSG:27397" minx="-6.43118e+06" miny="-1.61744e+06" maxx="-6.43117e+06" maxy="-1.61741e+06" />
            <BoundingBox CRS="EPSG:27398" minx="-6.43119e+06" miny="-2.10131e+06" maxx="-6.43118e+06" maxy="-2.10128e+06" />
            <BoundingBox CRS="EPSG:3034" minx="-3.45572e+06" miny="4.0772e+06" maxx="-3.45571e+06" maxy="4.07724e+06" />
            <BoundingBox CRS="EPSG:32636" minx="-2.06976e+06" miny="62.3557" maxx="-2.06973e+06" maxy="77.0661" />
            <BoundingBox CRS="EPSG:32635" minx="-1.36082e+06" miny="60.0679" maxx="-1.3608e+06" maxy="74.2385" />
            <BoundingBox CRS="EPSG:32633" minx="4.08752" miny="57.759" maxx="31.7616" maxy="71.3849" />
            <BoundingBox CRS="EPSG:32634" minx="-673749" miny="58.5659" maxx="-673721" maxy="72.3821" />
            <BoundingBox CRS="EPSG:32631" minx="1.33824e+06" miny="58.0824" maxx="1.33827e+06" maxy="71.7847" />
            <BoundingBox CRS="EPSG:32632" minx="668189" miny="57.6008" maxx="668216" maxy="71.1894" />
            <BoundingBox CRS="EPSG:4258" minx="0.00052095" miny="10.5113" maxx="0.000643847" maxy="10.5115" />
            <Identifier authority="Geonorge">Fylker</Identifier>
            <MetadataURL type="TC211">
              <Format>text/xml</Format>
              <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://www.geonorge.no/geonetwork/srv/nor/xml_iso19139?uuid=6093c8a8-fa80-11e6-bc64-92361f002671" />
            </MetadataURL>
          <Layer queryable="1" opaque="0" cascaded="0">
            <Name>fylker_hist</Name>
            <Title>Fylker historisk</Title>
            <CRS>EPSG:4258</CRS>
            <EX_GeographicBoundingBox>
                <westBoundLongitude>4.08752</westBoundLongitude>
                <eastBoundLongitude>31.7616</eastBoundLongitude>
                <southBoundLatitude>57.759</southBoundLatitude>
                <northBoundLatitude>71.3849</northBoundLatitude>
            </EX_GeographicBoundingBox>
            <BoundingBox CRS="EPSG:25829" minx="963037" miny="6.47734e+06" maxx="2.82329e+06" maxy="8.40056e+06" />
            <BoundingBox CRS="EPSG:25830" minx="751996" miny="6.42396e+06" maxx="2.50747e+06" maxy="8.27162e+06" />
            <BoundingBox CRS="EPSG:25831" minx="538744" miny="6.4024e+06" maxx="2.17805e+06" maxy="8.16191e+06" />
            <BoundingBox CRS="EPSG:25832" minx="207834" miny="6.40188e+06" maxx="1.83834e+06" maxy="8.07215e+06" />
            <BoundingBox CRS="EPSG:900913" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:3857" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:25833" minx="-147647" miny="6.40189e+06" maxx="1.49112e+06" maxy="8.00287e+06" />
            <BoundingBox CRS="EPSG:25834" minx="-499926" miny="6.40188e+06" maxx="1.13874e+06" maxy="8.00436e+06" />
            <BoundingBox CRS="EPSG:25835" minx="-846986" miny="6.40188e+06" maxx="783202" maxy="8.07416e+06" />
            <BoundingBox CRS="EPSG:25836" minx="-1.18647e+06" miny="6.40255e+06" maxx="455882" maxy="8.16443e+06" />
            <BoundingBox CRS="EPSG:900913" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:4326" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <BoundingBox CRS="EPSG:3006" minx="6.40189e+06" miny="-147647" maxx="8.00287e+06" maxy="1.49112e+06" />
            <BoundingBox CRS="EPSG:27391" minx="-26932.3" miny="-116936" maxx="1.68554e+06" maxy="1.50696e+06" />
            <BoundingBox CRS="EPSG:27392" minx="-26933.6" miny="-255733" maxx="1.65221e+06" maxy="1.37409e+06" />
            <BoundingBox CRS="EPSG:27393" minx="-26948.8" miny="-394346" maxx="1.62198e+06" maxy="1.24006e+06" />
            <BoundingBox CRS="EPSG:27394" minx="-26958" miny="-542540" maxx="1.59304e+06" maxy="1.09532e+06" />
            <BoundingBox CRS="EPSG:27395" minx="-26969.9" miny="-759025" maxx="1.55713e+06" maxy="881250" />
            <BoundingBox CRS="EPSG:27396" minx="-26985.6" miny="-993559" maxx="1.57502e+06" maxy="645827" />
            <BoundingBox CRS="EPSG:27397" minx="-27004.4" miny="-1.2258e+06" maxx="1.619e+06" maxy="408991" />
            <BoundingBox CRS="EPSG:27398" minx="-27022.2" miny="-1.46454e+06" maxx="1.67456e+06" maxy="161365" />
            <BoundingBox CRS="EPSG:3034" minx="3.42094e+06" miny="3.65787e+06" maxx="5.06158e+06" maxy="5.24245e+06" />
            <BoundingBox CRS="EPSG:32636" minx="-1.18647e+06" miny="6.40255e+06" maxx="455882" maxy="8.16443e+06" />
            <BoundingBox CRS="EPSG:32635" minx="-846986" miny="6.40188e+06" maxx="783202" maxy="8.07416e+06" />
            <BoundingBox CRS="EPSG:32633" minx="-147647" miny="6.40189e+06" maxx="1.49112e+06" maxy="8.00287e+06" />
            <BoundingBox CRS="EPSG:32634" minx="-499926" miny="6.40188e+06" maxx="1.13874e+06" maxy="8.00436e+06" />
            <BoundingBox CRS="EPSG:32631" minx="538744" miny="6.4024e+06" maxx="2.17805e+06" maxy="8.16191e+06" />
            <BoundingBox CRS="EPSG:32632" minx="207834" miny="6.40188e+06" maxx="1.83834e+06" maxy="8.07215e+06" />
            <BoundingBox CRS="EPSG:4258" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <Identifier authority="Geonorge">Fylker</Identifier>
            <MetadataURL type="TC211">
              <Format>text/xml</Format>
              <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://www.geonorge.no/geonetwork/srv/nor/xml_iso19139?uuid=6093c8a8-fa80-11e6-bc64-92361f002671" />
            </MetadataURL>
            <Style>
              <Name>default</Name>
              <Title>default</Title>
              <LegendURL width="241" height="29">
                 <Format>image/png</Format>
                 <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?language=nor&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=fylker_hist&amp;format=image/png&amp;STYLE=default" />
              </LegendURL>
            </Style>
          </Layer>
          <Layer queryable="1" opaque="0" cascaded="0">
            <Name>fylker_gjel</Name>
            <Title>Fylker gjeldene</Title>
            <CRS>EPSG:4258</CRS>
            <EX_GeographicBoundingBox>
                <westBoundLongitude>4.08752</westBoundLongitude>
                <eastBoundLongitude>31.7616</eastBoundLongitude>
                <southBoundLatitude>57.759</southBoundLatitude>
                <northBoundLatitude>71.3849</northBoundLatitude>
            </EX_GeographicBoundingBox>
            <BoundingBox CRS="EPSG:25829" minx="963037" miny="6.47734e+06" maxx="2.82329e+06" maxy="8.40056e+06" />
            <BoundingBox CRS="EPSG:25830" minx="751996" miny="6.42396e+06" maxx="2.50747e+06" maxy="8.27162e+06" />
            <BoundingBox CRS="EPSG:25831" minx="538744" miny="6.4024e+06" maxx="2.17805e+06" maxy="8.16191e+06" />
            <BoundingBox CRS="EPSG:25832" minx="207834" miny="6.40188e+06" maxx="1.83834e+06" maxy="8.07215e+06" />
            <BoundingBox CRS="EPSG:900913" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:3857" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:25833" minx="-147647" miny="6.40189e+06" maxx="1.49112e+06" maxy="8.00287e+06" />
            <BoundingBox CRS="EPSG:25834" minx="-499926" miny="6.40188e+06" maxx="1.13874e+06" maxy="8.00436e+06" />
            <BoundingBox CRS="EPSG:25835" minx="-846986" miny="6.40188e+06" maxx="783202" maxy="8.07416e+06" />
            <BoundingBox CRS="EPSG:25836" minx="-1.18647e+06" miny="6.40255e+06" maxx="455882" maxy="8.16443e+06" />
            <BoundingBox CRS="EPSG:900913" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:4326" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <BoundingBox CRS="EPSG:3006" minx="6.40189e+06" miny="-147647" maxx="8.00287e+06" maxy="1.49112e+06" />
            <BoundingBox CRS="EPSG:27391" minx="-26932.3" miny="-116936" maxx="1.68554e+06" maxy="1.50696e+06" />
            <BoundingBox CRS="EPSG:27392" minx="-26933.6" miny="-255733" maxx="1.65221e+06" maxy="1.37409e+06" />
            <BoundingBox CRS="EPSG:27393" minx="-26948.8" miny="-394346" maxx="1.62198e+06" maxy="1.24006e+06" />
            <BoundingBox CRS="EPSG:27394" minx="-26958" miny="-542540" maxx="1.59304e+06" maxy="1.09532e+06" />
            <BoundingBox CRS="EPSG:27395" minx="-26969.9" miny="-759025" maxx="1.55713e+06" maxy="881250" />
            <BoundingBox CRS="EPSG:27396" minx="-26985.6" miny="-993559" maxx="1.57502e+06" maxy="645827" />
            <BoundingBox CRS="EPSG:27397" minx="-27004.4" miny="-1.2258e+06" maxx="1.619e+06" maxy="408991" />
            <BoundingBox CRS="EPSG:27398" minx="-27022.2" miny="-1.46454e+06" maxx="1.67456e+06" maxy="161365" />
            <BoundingBox CRS="EPSG:3034" minx="3.42094e+06" miny="3.65787e+06" maxx="5.06158e+06" maxy="5.24245e+06" />
            <BoundingBox CRS="EPSG:32636" minx="-1.18647e+06" miny="6.40255e+06" maxx="455882" maxy="8.16443e+06" />
            <BoundingBox CRS="EPSG:32635" minx="-846986" miny="6.40188e+06" maxx="783202" maxy="8.07416e+06" />
            <BoundingBox CRS="EPSG:32633" minx="-147647" miny="6.40189e+06" maxx="1.49112e+06" maxy="8.00287e+06" />
            <BoundingBox CRS="EPSG:32634" minx="-499926" miny="6.40188e+06" maxx="1.13874e+06" maxy="8.00436e+06" />
            <BoundingBox CRS="EPSG:32631" minx="538744" miny="6.4024e+06" maxx="2.17805e+06" maxy="8.16191e+06" />
            <BoundingBox CRS="EPSG:32632" minx="207834" miny="6.40188e+06" maxx="1.83834e+06" maxy="8.07215e+06" />
            <BoundingBox CRS="EPSG:4258" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <Identifier authority="Geonorge">Fylker</Identifier>
            <MetadataURL type="TC211">
              <Format>text/xml</Format>
              <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://www.geonorge.no/geonetwork/srv/nor/xml_iso19139?uuid=6093c8a8-fa80-11e6-bc64-92361f002671" />
            </MetadataURL>
            <Style>
              <Name>default</Name>
              <Title>default</Title>
              <LegendURL width="243" height="29">
                 <Format>image/png</Format>
                 <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?language=nor&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=fylker_gjel&amp;format=image/png&amp;STYLE=default" />
              </LegendURL>
            </Style>
          </Layer>
          <Layer queryable="1" opaque="0" cascaded="0">
            <Name>fylker_fram</Name>
            <Title>Fylker framtidig</Title>
            <CRS>EPSG:4258</CRS>
            <EX_GeographicBoundingBox>
                <westBoundLongitude>4.08752</westBoundLongitude>
                <eastBoundLongitude>31.7616</eastBoundLongitude>
                <southBoundLatitude>57.759</southBoundLatitude>
                <northBoundLatitude>71.3849</northBoundLatitude>
            </EX_GeographicBoundingBox>
            <BoundingBox CRS="EPSG:25829" minx="963037" miny="6.47734e+06" maxx="2.82329e+06" maxy="8.40056e+06" />
            <BoundingBox CRS="EPSG:25830" minx="751996" miny="6.42396e+06" maxx="2.50747e+06" maxy="8.27162e+06" />
            <BoundingBox CRS="EPSG:25831" minx="538744" miny="6.4024e+06" maxx="2.17805e+06" maxy="8.16191e+06" />
            <BoundingBox CRS="EPSG:25832" minx="207834" miny="6.40188e+06" maxx="1.83834e+06" maxy="8.07215e+06" />
            <BoundingBox CRS="EPSG:900913" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:3857" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:25833" minx="-147647" miny="6.40189e+06" maxx="1.49112e+06" maxy="8.00287e+06" />
            <BoundingBox CRS="EPSG:25834" minx="-499926" miny="6.40188e+06" maxx="1.13874e+06" maxy="8.00436e+06" />
            <BoundingBox CRS="EPSG:25835" minx="-846986" miny="6.40188e+06" maxx="783202" maxy="8.07416e+06" />
            <BoundingBox CRS="EPSG:25836" minx="-1.18647e+06" miny="6.40255e+06" maxx="455882" maxy="8.16443e+06" />
            <BoundingBox CRS="EPSG:900913" minx="455021" miny="7.91686e+06" maxx="3.53568e+06" maxy="1.15352e+07" />
            <BoundingBox CRS="EPSG:4326" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <BoundingBox CRS="EPSG:3006" minx="6.40189e+06" miny="-147647" maxx="8.00287e+06" maxy="1.49112e+06" />
            <BoundingBox CRS="EPSG:27391" minx="-26932.3" miny="-116936" maxx="1.68554e+06" maxy="1.50696e+06" />
            <BoundingBox CRS="EPSG:27392" minx="-26933.6" miny="-255733" maxx="1.65221e+06" maxy="1.37409e+06" />
            <BoundingBox CRS="EPSG:27393" minx="-26948.8" miny="-394346" maxx="1.62198e+06" maxy="1.24006e+06" />
            <BoundingBox CRS="EPSG:27394" minx="-26958" miny="-542540" maxx="1.59304e+06" maxy="1.09532e+06" />
            <BoundingBox CRS="EPSG:27395" minx="-26969.9" miny="-759025" maxx="1.55713e+06" maxy="881250" />
            <BoundingBox CRS="EPSG:27396" minx="-26985.6" miny="-993559" maxx="1.57502e+06" maxy="645827" />
            <BoundingBox CRS="EPSG:27397" minx="-27004.4" miny="-1.2258e+06" maxx="1.619e+06" maxy="408991" />
            <BoundingBox CRS="EPSG:27398" minx="-27022.2" miny="-1.46454e+06" maxx="1.67456e+06" maxy="161365" />
            <BoundingBox CRS="EPSG:3034" minx="3.42094e+06" miny="3.65787e+06" maxx="5.06158e+06" maxy="5.24245e+06" />
            <BoundingBox CRS="EPSG:32636" minx="-1.18647e+06" miny="6.40255e+06" maxx="455882" maxy="8.16443e+06" />
            <BoundingBox CRS="EPSG:32635" minx="-846986" miny="6.40188e+06" maxx="783202" maxy="8.07416e+06" />
            <BoundingBox CRS="EPSG:32633" minx="-147647" miny="6.40189e+06" maxx="1.49112e+06" maxy="8.00287e+06" />
            <BoundingBox CRS="EPSG:32634" minx="-499926" miny="6.40188e+06" maxx="1.13874e+06" maxy="8.00436e+06" />
            <BoundingBox CRS="EPSG:32631" minx="538744" miny="6.4024e+06" maxx="2.17805e+06" maxy="8.16191e+06" />
            <BoundingBox CRS="EPSG:32632" minx="207834" miny="6.40188e+06" maxx="1.83834e+06" maxy="8.07215e+06" />
            <BoundingBox CRS="EPSG:4258" minx="57.759" miny="4.08752" maxx="71.3849" maxy="31.7616" />
            <Identifier authority="Geonorge">Fylker</Identifier>
            <MetadataURL type="TC211">
              <Format>text/xml</Format>
              <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://www.geonorge.no/geonetwork/srv/nor/xml_iso19139?uuid=6093c8a8-fa80-11e6-bc64-92361f002671" />
            </MetadataURL>
            <Style>
              <Name>default</Name>
              <Title>default</Title>
              <LegendURL width="244" height="30">
                 <Format>image/png</Format>
                 <OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:type="simple" xlink:href="https://wms.geonorge.no/skwms1/wms.adm_enheter2?language=nor&amp;version=1.3.0&amp;service=WMS&amp;request=GetLegendGraphic&amp;sld_version=1.1.0&amp;layer=fylker_fram&amp;format=image/png&amp;STYLE=default" />
              </LegendURL>
            </Style>
          </Layer>
        </Layer>
      </Layer>
    </Capability>
    </WMS_Capabilities>
    `)
      );
    }
  ),
];
