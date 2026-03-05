-- Replace fake 1-800 numbers with real Kenyan helpline numbers
UPDATE services SET contact_phone = '999 / 112', contact_url = NULL WHERE title = 'Emergency Shelter';
UPDATE services SET contact_phone = '0800 723 253', contact_url = NULL WHERE title = 'Food Assistance';
UPDATE services SET contact_phone = '1195', contact_url = NULL WHERE title = 'Healthcare Services';
UPDATE services SET contact_phone = '0722 509 760', contact_url = NULL WHERE title = 'Legal Aid';
UPDATE services SET contact_phone = '0800 720 990', contact_url = NULL WHERE title = 'Job Training';
