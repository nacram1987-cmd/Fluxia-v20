-- Authorized by the user 13/10/2026. Synthetic before/after tests passed.
ALTER TABLE public.fluxia_contactos ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.accept_invitation(token_input text, usuario_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  caller uuid := auth.uid();
  v_contacto_id uuid;
  v_user_id_1 uuid;
BEGIN
  IF caller IS NULL OR usuario_id IS DISTINCT FROM caller THEN
    RAISE EXCEPTION 'Unauthorized invitation recipient' USING ERRCODE = '42501';
  END IF;
  SELECT id, user_id_1 INTO v_contacto_id, v_user_id_1
  FROM public.fluxia_contactos
  WHERE gasto_invite_token = token_input AND estado = 'pendiente'
    AND user_id_2 = caller
  FOR UPDATE;
  IF v_contacto_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invitación no encontrada o ya procesada');
  END IF;
  UPDATE public.fluxia_contactos
  SET estado = 'aceptado', fecha_aceptacion = now()
  WHERE id = v_contacto_id AND user_id_2 = caller AND estado = 'pendiente';
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invitación no encontrada o ya procesada');
  END IF;
  RETURN json_build_object('success', true, 'contacto_id', v_contacto_id,
    'usuario_invitador', v_user_id_1, 'mensaje', 'Invitación aceptada');
END;
$function$;
REVOKE EXECUTE ON FUNCTION public.accept_invitation(text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invitation(text,uuid) TO authenticated;

