"use client";

export function AiPostForm() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">צור פוסט AI</h1>

      <div className="space-y-8 max-w-xl">
        <iframe
          src="https://n8n.n8n-docker.fun/form/8b0322d7-1bd7-464b-be8c-733be6f84f91"
          width="100%"
          height="400"
          style={{ border: 0 }}
          loading="lazy"
          title="n8n form"
        />
      </div>
    </div>
  );
}
