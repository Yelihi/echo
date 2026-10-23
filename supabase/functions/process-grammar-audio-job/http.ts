export function authorize(request: Request, secret: string | undefined): boolean {
  return (
    Boolean(secret?.trim()) && request.headers.get("authorization") === `Bearer ${secret?.trim()}`
  );
}
