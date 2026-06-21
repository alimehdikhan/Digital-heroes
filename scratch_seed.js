const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

const supabaseUrl = urlMatch[1].trim();
const supabaseKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { error } = await supabase.from('charities').insert([
    { name: 'Golf Foundation', description: 'Introducing more people to golf across the UK.', website_url: 'https://golf-foundation.org.uk', is_active: true, total_contributed: 2450.00 },
    { name: 'Macmillan Cancer Support', description: 'Supporting people living with cancer.', website_url: 'https://www.macmillan.org.uk', is_active: false, total_contributed: 1200.00 },
    { name: 'Children in Need', description: 'Helping disadvantaged children across the UK.', website_url: 'https://www.bbcchildreninneed.co.uk', is_active: false, total_contributed: 800.00 }
  ]);
  console.log(error || 'Seeded charities successfully');
}
run();
