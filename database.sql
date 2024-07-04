BEGIN;

DO
$$BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'fishemi_api_user') THEN
    EXECUTE 'REASSIGN OWNED BY fishemi_api_user TO postgres';
    EXECUTE 'DROP OWNED BY fishemi_api_user';
    EXECUTE 'DROP ROLE IF EXISTS fishemi_api_user';
  END IF;
END$$;

CREATE ROLE fishemi_api_user LOGIN PASSWORD '277070589d66a6b4ae8214b9d5337299e4b59c7423046';

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS company CASCADE;
CREATE TABLE company (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL
);

DROP TABLE IF EXISTS admin_account CASCADE;
CREATE TABLE admin_account (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  otp_code VARCHAR(50),
  otp_code_expiration TIMESTAMP WITH TIME ZONE,
  roles TEXT NOT NULL,
  company_id UUID NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE admin_account ADD FOREIGN KEY (company_id) REFERENCES company (id);

DROP TABLE IF EXISTS employee CASCADE;
CREATE TABLE employee (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL
);

DROP TABLE IF EXISTS list CASCADE;
CREATE TABLE list (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  company_id UUID NOT NULL
);
ALTER TABLE list ADD FOREIGN KEY (company_id) REFERENCES company (id);

DROP TABLE IF EXISTS employee_list CASCADE;
CREATE TABLE employee_list (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  list_id UUID NOT NULL,
  employee_id UUID NOT NULL
);
ALTER TABLE employee_list
  ADD FOREIGN KEY (list_id) REFERENCES list (id),
  ADD FOREIGN KEY (employee_id) REFERENCES employee (id);

DROP TABLE IF EXISTS campaign CASCADE;
CREATE TABLE campaign (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  company_id UUID NOT NULL,
  payment_stripe_id TEXT,
  amount_paid_without_vat NUMERIC(10, 2) NOT NULL,
  payment_status TEXT NOT NULL
);
ALTER TABLE campaign ADD FOREIGN KEY (company_id) REFERENCES company (id);

DROP TABLE IF EXISTS campaign_list CASCADE;
CREATE TABLE campaign_list (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  list_id UUID NOT NULL,
  campaign_id UUID NOT NULL
);
ALTER TABLE campaign_list
  ADD FOREIGN KEY (list_id) REFERENCES list (id),
  ADD FOREIGN KEY (campaign_id) REFERENCES campaign (id);

DROP TABLE IF EXISTS event CASCADE;
CREATE TABLE event (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL,
  user_id UUID NOT NULL,
  campaign_id UUID NOT NULL
);
ALTER TABLE event
  ADD FOREIGN KEY (user_id) REFERENCES employee (id),
  ADD FOREIGN KEY (campaign_id) REFERENCES campaign (id);

GRANT USAGE ON SCHEMA public TO fishemi_api_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO fishemi_api_user;

-- mock data
INSERT INTO company (id, name) VALUES
  ('fd9ec08d-1faa-484b-b98e-b97cc85195a9', 'Pixel gagnant'),
  ('b0cbc124-c848-4b48-8ad6-f51e05974363', 'HABENWIR');

INSERT INTO admin_account (full_name, email, roles, company_id) VALUES
  ('Administrateur', 'administration@pixelgagnant.net', 'admin,writer,lector', 'fd9ec08d-1faa-484b-b98e-b97cc85195a9'),
  ('Stéphanie Test', 'ressources-humaine@pixelgagnant.net', 'lector', 'fd9ec08d-1faa-484b-b98e-b97cc85195a9'),
  ('Patrick HABENWIR', 'ceo@habenwir.com', 'admin,writer,lector', 'b0cbc124-c848-4b48-8ad6-f51e05974363');

INSERT INTO employee (id, full_name, email) VALUES
  ('e20a48f4-ad3b-4ce2-9690-03e09421dd85', 'Maxine Rakestraw', 'mrakestraw0@pixelgagnant.net'),
  ('8b2e1a0e-49f6-4185-98ee-58e42482efff', 'Meredith Reedman', 'mreedman1@pixelgagnant.net'),
  ('a1136387-0786-4892-a445-77cbed88f34e', 'Ellie Conduit', 'econduit2@pixelgagnant.net'),
  ('0dadb9da-9305-4ca0-88e7-51ed3da48918', 'Claiborne Pymm', 'cpymm3@pixelgagnant.net'),
  ('9316c97d-eaa7-440e-8348-86d63eb0e662', 'Winfield Baumler', 'wbaumler4@pixelgagnant.net'),
  ('27d0bebb-85f6-487e-9fc2-871d1bf90e4e', 'Dallas Trevarthen', 'dtrevarthen5@pixelgagnant.net'),
  ('7b7c217b-13f8-4540-9ec6-e8c3a5ab211e', 'Emmanuel Box', 'ebox6@pixelgagnant.net'),
  ('8378895a-cfcc-42c9-ae99-a2dbb48c41a1', 'Newton Souster', 'nsouster7@habenwir.com'),
  ('e406822e-4fae-4eb0-b849-61676731eeec', 'Jeni Stanier', 'jstanier8@habenwir.com'),
  ('467cbc10-0d8f-4983-a637-9085933b3a8b', 'Hetti Pervoe', 'hpervoe9@habenwir.com');

INSERT INTO list (id, name, company_id) VALUES
  ('b115d6ee-8ea5-4291-b354-89400d47aba7', 'DSI Pixel Gagnant', 'fd9ec08d-1faa-484b-b98e-b97cc85195a9'),
  ('2e40a240-7e19-4bdc-93aa-af72097f596e', 'Codir Pixel Gagnant', 'fd9ec08d-1faa-484b-b98e-b97cc85195a9');

INSERT INTO employee_list (list_id, employee_id) VALUES
  ('b115d6ee-8ea5-4291-b354-89400d47aba7', 'e20a48f4-ad3b-4ce2-9690-03e09421dd85'),
  ('b115d6ee-8ea5-4291-b354-89400d47aba7', '8b2e1a0e-49f6-4185-98ee-58e42482efff'),
  ('b115d6ee-8ea5-4291-b354-89400d47aba7', 'a1136387-0786-4892-a445-77cbed88f34e'),
  ('b115d6ee-8ea5-4291-b354-89400d47aba7', '0dadb9da-9305-4ca0-88e7-51ed3da48918'),
  ('b115d6ee-8ea5-4291-b354-89400d47aba7', '9316c97d-eaa7-440e-8348-86d63eb0e662'),
  ('2e40a240-7e19-4bdc-93aa-af72097f596e', '27d0bebb-85f6-487e-9fc2-871d1bf90e4e'),
  ('2e40a240-7e19-4bdc-93aa-af72097f596e', '7b7c217b-13f8-4540-9ec6-e8c3a5ab211e');

INSERT INTO campaign (id, company_id, name, payment_status, amount_paid_without_vat) VALUES
  ('18bd2562-c5fc-4191-9d92-c5c059448230', 'fd9ec08d-1faa-484b-b98e-b97cc85195a9', 'Test campagne PIXEL DSI', 'paid', 1000);

INSERT INTO campaign_list (list_id, campaign_id) VALUES
  ('b115d6ee-8ea5-4291-b354-89400d47aba7', '18bd2562-c5fc-4191-9d92-c5c059448230');

COMMIT;
