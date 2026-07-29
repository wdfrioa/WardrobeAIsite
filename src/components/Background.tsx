"use client";

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10 grid-bg grain">
      {/* Glow circles */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full glow-animate"
        style={{
          background:
            "radial-gradient(circle, rgba(177,136,106,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full glow-animate"
        style={{
          background:
            "radial-gradient(circle, rgba(201,166,140,0.12) 0%, transparent 70%)",
          animationDelay: "2s",
        }}
      />
      <div
        className="absolute bottom-[-10%] left-[30%] w-[700px] h-[700px] rounded-full glow-animate"
        style={{
          background:
            "radial-gradient(circle, rgba(143,106,79,0.1) 0%, transparent 70%)",
          animationDelay: "4s",
        }}
      />
    </div>
  );
}
