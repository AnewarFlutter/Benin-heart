import { NextRequest, NextResponse } from "next/server";

type Middleware = (request: NextRequest) => Promise<NextResponse | void>;

export async function runMiddlewares(
  request: NextRequest,
  middlewares: Middleware[]
): Promise<NextResponse> {
  for (const middleware of middlewares) {
    const response = await middleware(request);
    if (response) {
      // Si un middleware retourne une réponse, on arrête l'exécution
      return response;
    }
  }
  return NextResponse.next(); // Si aucun middleware ne retourne de réponse, continuer
}
