export type AreaEntry = { bn: string; en: string; aliases?: string[] };

export const BD_AREAS: AreaEntry[] = [
  { bn: "মিরপুর", en: "Mirpur" },
  { bn: "মোহাম্মদপুর", en: "Mohammadpur" },
  { bn: "ধানমন্ডি", en: "Dhanmondi" },
  { bn: "গুলশান", en: "Gulshan" },
  { bn: "বনানী", en: "Banani" },
  { bn: "বারিধারা", en: "Baridhara" },
  { bn: "উত্তরা", en: "Uttara" },
  { bn: "বসুন্ধরা", en: "Bashundhara", aliases: ["Bashundhara R/A"] },
  { bn: "খিলগাঁও", en: "Khilgaon" },
  { bn: "রামপুরা", en: "Rampura" },
  { bn: "বাড্ডা", en: "Badda" },
  { bn: "মালিবাগ", en: "Malibagh" },
  { bn: "মগবাজার", en: "Moghbazar", aliases: ["Mogbazar"] },
  { bn: "মতিঝিল", en: "Motijheel" },
  { bn: "পল্টন", en: "Paltan" },
  { bn: "শাহবাগ", en: "Shahbagh" },
  { bn: "নিউমার্কেট", en: "New Market" },
  { bn: "আজিমপুর", en: "Azimpur" },
  { bn: "লালবাগ", en: "Lalbagh" },
  { bn: "পুরান ঢাকা", en: "Old Dhaka" },
  { bn: "যাত্রাবাড়ী", en: "Jatrabari" },
  { bn: "ডেমরা", en: "Demra" },
  { bn: "কেরানীগঞ্জ", en: "Keraniganj" },
  { bn: "সাভার", en: "Savar" },
  { bn: "গাজীপুর", en: "Gazipur" },
  { bn: "নারায়ণগঞ্জ", en: "Narayanganj" },
  { bn: "টঙ্গী", en: "Tongi" },
  { bn: "কামরাঙ্গীরচর", en: "Kamrangirchar" },
  { bn: "হাজারীবাগ", en: "Hazaribagh" },
  { bn: "শ্যামলী", en: "Shyamoli" },
  { bn: "কল্যাণপুর", en: "Kalyanpur" },
  { bn: "আগারগাঁও", en: "Agargaon" },
  { bn: "শেওড়াপাড়া", en: "Shewrapara" },
  { bn: "কাফরুল", en: "Kafrul" },
  { bn: "পল্লবী", en: "Pallabi" },
  { bn: "ভাটারা", en: "Bhatara" },
  { bn: "মহাখালী", en: "Mohakhali" },
  { bn: "তেজগাঁও", en: "Tejgaon" },
  { bn: "ফার্মগেট", en: "Farmgate" },
  { bn: "কারওয়ান বাজার", en: "Karwan Bazar" },
  { bn: "সেগুনবাগিচা", en: "Segunbagicha" },
  { bn: "এলিফ্যান্ট রোড", en: "Elephant Road" },
  { bn: "কাকরাইল", en: "Kakrail" },
  { bn: "শান্তিনগর", en: "Shantinagar" },
  { bn: "রায়েরবাজার", en: "Rayerbazar" },
  { bn: "হাতিরঝিল", en: "Hatirjheel" },
  { bn: "নিকুঞ্জ", en: "Nikunja" },
  { bn: "খিলক্ষেত", en: "Khilkhet" },
  { bn: "আশুলিয়া", en: "Ashulia" },
  { bn: "পূর্বাচল", en: "Purbachal" },
  { bn: "নওগাঁ", en: "Naogaon" },
  { bn: "চট্টগ্রাম", en: "Chattogram", aliases: ["Chittagong"] },
  { bn: "সিলেট", en: "Sylhet" },
  { bn: "রাজশাহী", en: "Rajshahi" },
  { bn: "খুলনা", en: "Khulna" },
  { bn: "বরিশাল", en: "Barishal", aliases: ["Barisal"] },
  { bn: "রংপুর", en: "Rangpur" },
  { bn: "ময়মনসিংহ", en: "Mymensingh" },
  { bn: "কুমিল্লা", en: "Cumilla", aliases: ["Comilla"] },
  { bn: "কক্সবাজার", en: "Coxs Bazar", aliases: ["Cox's Bazar", "Coxbazar"] },
  { bn: "বগুড়া", en: "Bogura", aliases: ["Bogra"] },
  { bn: "যশোর", en: "Jashore", aliases: ["Jessore"] },
  { bn: "দিনাজপুর", en: "Dinajpur" },
  { bn: "পাবনা", en: "Pabna" },
  { bn: "টাঙ্গাইল", en: "Tangail" },
  { bn: "ফরিদপুর", en: "Faridpur" },
  { bn: "নরসিংদী", en: "Narsingdi" },
  { bn: "মুন্সিগঞ্জ", en: "Munshiganj" },
  { bn: "মানিকগঞ্জ", en: "Manikganj" },
];

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function loose(s: string): string {
  return stripDiacritics(s).toLowerCase().replace(/[^a-z0-9ঀ-৿]/g, "");
}

export function expandAreaQuery(input: string): string[] {
  const raw = input.trim();
  if (!raw) return [];

  const needle = loose(raw);
  const variants = new Set<string>([raw]);

  for (const entry of BD_AREAS) {
    const candidates = [entry.bn, entry.en, ...(entry.aliases ?? [])];
    const hit = candidates.some((c) => {
      const l = loose(c);
      return l === needle || l.includes(needle) || needle.includes(l);
    });
    if (hit) {
      for (const c of candidates) variants.add(c);
    }
  }

  return Array.from(variants);
}
