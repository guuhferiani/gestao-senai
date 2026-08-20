// Utilitário de Rate Limiting em Memória para prevenção de ataques de Força Bruta (Brute Force / DoS)

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const trackers = new Map<string, RateLimitRecord>();

// Limpa registros expirados periodicamente a cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of trackers.entries()) {
      if (now > record.resetAt) {
        trackers.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Verifica se um identificador (ex: IP ou E-mail) ultrapassou o limite permitido de requisições.
 * @param identifier String única para identificação (ex: IP do cliente ou email)
 * @param maxRequests Número máximo de requisições permitidas na janela de tempo
 * @param windowMs Duração da janela em milissegundos (padrão: 60 segundos)
 * @returns { success: boolean; remaining: number; resetInMs: number }
 */
export function checkRateLimit(
  identifier: string,
  maxRequests = 5,
  windowMs = 60 * 1000
): { success: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = trackers.get(identifier);

  if (!record || now > record.resetAt) {
    trackers.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      remaining: maxRequests - 1,
      resetInMs: windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: maxRequests - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}
