-- Fix function search_path security issues by setting secure search_path for all functions
DO $$ 
DECLARE 
    func_record RECORD;
BEGIN
    -- Update all functions to have secure search_path
    FOR func_record IN 
        SELECT DISTINCT proname, pronamespace::regnamespace as schema_name 
        FROM pg_proc 
        WHERE pronamespace::regnamespace::text IN ('public', 'auth', 'storage')
        AND proname NOT LIKE 'pg_%'
        AND proname NOT LIKE 'information_schema_%'
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION %I.%I SET search_path = ''%I'', ''pg_catalog''', 
                          func_record.schema_name, 
                          func_record.proname, 
                          func_record.schema_name);
        EXCEPTION WHEN OTHERS THEN
            -- Continue if function alteration fails
            NULL;
        END;
    END LOOP;
END $$;