import { LineString, Point } from "geojson";

interface Street {
  id: Number;
  osm_id: String;
  nama: String;
  truk: Number;
  pickup: Number;
  roda3: Number;
  last_modified_time: Date;
  meta: String;
  geom: any;
}

export default Street;