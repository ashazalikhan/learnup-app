export type ClassroomActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string; denied?: boolean };

export function actionError(message: string, denied = false): ClassroomActionResult {
  return { ok: false, error: message, denied };
}

export function actionSuccess(message?: string): ClassroomActionResult {
  return message ? { ok: true, message } : { ok: true };
}
