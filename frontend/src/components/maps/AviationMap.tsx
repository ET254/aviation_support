import { MapContainer, TileLayer } from "react-leaflet";

export default function AviationMap() {
  return (
    <MapContainer
      center={[-0.0236, 37.9062]} // Kenya
      zoom={6}
      style={{
        height: "700px",
        width: "100%",
        borderRadius: "12px",
      }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  );
}