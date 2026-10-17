"use client";

export default function ContactMap() {
  // El Kawther, Hurghada coordinates (near Mostafa Kamel St & Abo Omar Restaurant)
  const lat = 27.1895;
  const lng = 33.8236;
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=16&output=embed`;

  return (
    <div className="relative flex h-full min-h-[460px] w-full flex-col overflow-hidden rounded-[20px] border border-[#d8e0dd] bg-[#eef2f0] shadow-xs">
      <iframe
        title="DreamLife Office Location - El Kawther, Hurghada"
        src={mapUrl}
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full min-h-[460px] w-full border-0 object-cover"
      />
    </div>
  );
}
