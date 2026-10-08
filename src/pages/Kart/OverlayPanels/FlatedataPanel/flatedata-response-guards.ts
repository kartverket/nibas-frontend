import { BopliktomraadeResponse, GrunnkretsResponse, KommuneResponse, StemmekretsResponse } from "types/api";

export const isGrunnkretsResponse = (value: object): value is GrunnkretsResponse =>
  "informasjon" in value &&
  !isBopliktomraadeResponse(value) &&
  !isStemmekretsResponse(value) &&
  !isKommuneResponse(value);

export const isKommuneResponse = (value: object): value is KommuneResponse => "samiskforvaltningsomraade" in value;

export const isStemmekretsResponse = (value: object): value is StemmekretsResponse =>
  "tellekretsnummer" in value && "tellekretsnavn" in value;

export const isBopliktomraadeResponse = (value: object): value is BopliktomraadeResponse =>
  "gjelderKunDelAvKommunen" in value &&
  "forskriftsreferanse" in value &&
  "gjeldendeMaterielleVilkaar" in value &&
  "andreLokaleAvgrensninger" in value &&
  "harUsikkerAvgrensning" in value;
