import {useCallback, useEffect, useRef, useState} from 'react';

const DEFAULT_RESEND_COOLDOWN_SEC = 60;
/** Password-reset / verification email OTP lifetime. */
const DEFAULT_CODE_EXPIRY_SEC = 5 * 60;

function formatMmSs(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

type UseEmailCodeTimersOptions = {
  resendCooldownSec?: number;
  codeExpirySec?: number;
};

/**
 * Professional resend cooldown + code expiry timers for email OTP flows.
 * Call `armAfterSend()` after every successful send / resend.
 */
export function useEmailCodeTimers(options: UseEmailCodeTimersOptions = {}) {
  const resendCooldownSec = options.resendCooldownSec ?? DEFAULT_RESEND_COOLDOWN_SEC;
  const codeExpirySec = options.codeExpirySec ?? DEFAULT_CODE_EXPIRY_SEC;

  const [resendRemaining, setResendRemaining] = useState(0);
  const [expiryRemaining, setExpiryRemaining] = useState(0);
  const [armed, setArmed] = useState(false);
  const resendEndsAtRef = useRef(0);
  const expiryEndsAtRef = useRef(0);

  const armAfterSend = useCallback(() => {
    const now = Date.now();
    resendEndsAtRef.current = now + resendCooldownSec * 1000;
    expiryEndsAtRef.current = now + codeExpirySec * 1000;
    setArmed(true);
    setResendRemaining(resendCooldownSec);
    setExpiryRemaining(codeExpirySec);
  }, [codeExpirySec, resendCooldownSec]);

  useEffect(() => {
    if (!armed) {
      return;
    }

    const tick = () => {
      const now = Date.now();
      setResendRemaining(Math.max(0, Math.ceil((resendEndsAtRef.current - now) / 1000)));
      setExpiryRemaining(Math.max(0, Math.ceil((expiryEndsAtRef.current - now) / 1000)));
    };

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [armed, resendCooldownSec, codeExpirySec]);

  const canResend = armed && resendRemaining <= 0;
  const isExpired = armed && expiryRemaining <= 0;
  const isExpiringSoon = armed && expiryRemaining > 0 && expiryRemaining <= 60;

  return {
    armed,
    armAfterSend,
    canResend,
    resendRemaining,
    resendLabel:
      resendRemaining > 0
        ? `Resend code in ${formatMmSs(resendRemaining)}`
        : 'Resend code',
    expiryRemaining,
    expiryLabel: !armed
      ? null
      : isExpired
        ? 'Code expired — request a new one'
        : `Code expires in ${formatMmSs(expiryRemaining)}`,
    isExpired,
    isExpiringSoon,
  };
}
