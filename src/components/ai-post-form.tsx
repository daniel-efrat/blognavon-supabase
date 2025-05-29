"use client";

export function AiPostForm() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">צור פוסט AI</h1>

      <div className="space-y-8 max-w-xl">
        <iframe
          src="https://n8n.n8n-docker.fun/form/293ef3f8-30b7-4b23-9b7a-679b2372ef53"
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
