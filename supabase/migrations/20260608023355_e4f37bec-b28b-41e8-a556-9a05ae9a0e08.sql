ALTER TABLE public.gifts DROP CONSTRAINT IF EXISTS gifts_type_check;
ALTER TABLE public.gifts ADD CONSTRAINT gifts_type_check CHECK (type IN ('carta','musica','momentos','mapa','bundle'));