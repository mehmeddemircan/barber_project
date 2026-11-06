import { ImageResponse } from "next/og";

export const alt = "Mehmet İrşad Güder Barber Shop — Talas, Kayseri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111b18",
          color: "#f7f9f6",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "1060px",
            height: "490px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px",
            border: "2px solid #e5b02e",
            background: "linear-gradient(135deg, #1d2b26 0%, #111b18 70%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <div
              style={{
                width: "96px",
                height: "96px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #e5b02e",
                borderRadius: "20px",
                color: "#e5b02e",
                fontSize: "44px",
                fontWeight: 700,
              }}
            >
              MG
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#e5b02e", fontSize: "20px", letterSpacing: "8px" }}>
                BERBER SHOP
              </span>
              <span style={{ marginTop: "14px", fontSize: "58px", fontWeight: 700 }}>
                MEHMET İRŞAD GÜDER
              </span>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: "2px",
              marginTop: "46px",
              backgroundColor: "#e5b02e",
            }}
          />
          <span style={{ marginTop: "28px", color: "#d0d8d2", fontSize: "22px", letterSpacing: "6px" }}>
            PROFESYONEL KESİM · TALAS, KAYSERİ
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
