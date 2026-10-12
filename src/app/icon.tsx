import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "linear-gradient(135deg, #0B4A3A 0%, #06261E 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#C9A24B",
          fontWeight: 700,
          borderRadius: 6,
          border: "1px solid #C9A24B",
          fontFamily: "serif",
        }}
      >
        K
      </div>
    ),
    {
      ...size,
    }
  );
}
