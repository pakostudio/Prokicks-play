insert into public.spots (id, name, city, address, status, activity_score) values
('11111111-1111-1111-1111-111111111111','ProKicks Roma Norte','CDMX','Roma Norte, CDMX','active',92),
('22222222-2222-2222-2222-222222222222','ProKicks Polanco','CDMX','Polanco, CDMX','active',78),
('33333333-3333-3333-3333-333333333333','ProKicks Coyoacán','CDMX','Coyoacán, CDMX','maintenance',41)
on conflict (id) do nothing;

insert into public.devices (spot_id, name, qr_code, status) values
('11111111-1111-1111-1111-111111111111','Dispositivo Roma 001','PK-ROMA-001','active'),
('22222222-2222-2222-2222-222222222222','Dispositivo Polanco 001','PK-POLANCO-001','active'),
('33333333-3333-3333-3333-333333333333','Dispositivo Coyoacán 001','PK-COYO-001','maintenance')
on conflict (qr_code) do nothing;
