import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "villages.db")
JSON_PATH = os.path.join(os.path.dirname(__file__), "villages.json")

# Complete Tamil Nadu Administrative Hierarchy (38 Districts & Taluks/Villages)
TAMIL_NADU_DATA = {
    "Ariyalur": {
        "code": "616",
        "url": "https://vlist.in/district/616.html",
        "taluks": {
            "Ariyalur": ["Alagiyamanavalam", "Alanduraiyarkattalai", "Ammenabath", "Andipattakkadu", "Annimangalam", "Ariyalur (North)", "Arungal", "Avansuthamalli", "Ayanathur", "Chinnapattakadu", "Edayathankudi", "Elakurichi", "Govindapuram", "Kallankurichi", "Manabayachanallur", "Melur", "Nagamangalam", "Ottakoil", "Periyagalankotti", "Poyyur", "Rayampuram", "Sennivanam", "Sirugudi", "Thatchankurichi", "Thirumanur", "Valajanagaram", "Varanavasi", "Vennankuzhi", "Vilandai"],
            "Sendurai": ["Adanakottai", "Alathiyur", "Anandavadi", "Asaveerankudikadu", "Chinnaparangani", "Manapathur", "Mudikandan", "Nakkambadi", "Nallampalayam", "Palayasiruvangur", "Periyakurichi", "Pilakurichi", "Ponparappi", "Sathanpadi", "Sendurai", "Sirukadambur", "Thaluthaimedu", "Unjini", "Vanjenagaram", "Veerakkan"],
            "Udayarpalayam": ["Ambapur", "Andimadam", "Anikadhichan", "Ayanathathanur", "Devaranjayampettai", "Gangaikondacholapuram", "Jayankondam", "Kadalangudi", "Kulumor", "Kundavai", "Mathur", "Natesampettai", "Paluvoor", "Pyree", "Srimushnam", "T.Palur", "Udayarpalayam", "Varanavasi", "Vembukudi"]
        }
    },
    "Chengalpattu": {
        "code": "604A",
        "url": "https://vlist.in/district/604.html",
        "taluks": {
            "Chengalpattu": ["Alapakkam", "Anur", "Athur", "Chengalpattu (M)", "Guduvancheri", "Hanumanthatheru", "Kattankulathur", "Kayar", "Kolathur", "Kovalam", "Melamaiyur", "Maraimalai Nagar", "Nethapakkam", "Nellikuppam", "Ozhalur", "Padalam", "Paranur", "Singaperumal Koil", "Thiruporur", "Vandalur", "Veerapuram"],
            "Tambaram": ["Chromepet", "Chitlapakkam", "Hasthinapuram", "Kadaperi", "Madambakkam", "Mudichur", "Peerkankaranai", "Perungalathur", "Rajakilpakkam", "Selaiyur", "Sembakkam", "Tambaram (M)", "Tiruniromalai", "Vengaivasal"],
            "Thiruporur": ["Illalur", "Kelambakkam", "Kovalam", "Muttukadu", "Navalur", "Padur", "Pudupakkam", "Siruseri", "Thaiyur", "Thiruporur"]
        }
    },
    "Chennai": {
        "code": "603",
        "url": "https://vlist.in/district/603.html",
        "taluks": {
            "Adyar": ["Adyar", "Besant Nagar", "Guindy", "Kotturpuram", "Mylapore", "Thiruvanmiyur", "Velachery"],
            "Egmore": ["Chetpet", "Egmore", "Kilpauk", "Nungambakkam", "Purasawalkam"],
            "Mambalam": ["Ashok Nagar", "KK Nagar", "Kodambakkam", "T. Nagar", "Vadapalani"],
            "Mylapore": ["Alwarpet", "Mylapore", "R.A. Puram", "Royapettah", "Santhome"],
            "Perambur": ["Ayanavaram", "Kolathur", "Perambur", "Purasawalkam", "Vyasarpadi"],
            "Velachery": ["Madipakkam", "Pallikaranai", "Taramani", "Velachery"]
        }
    },
    "Coimbatore": {
        "code": "632",
        "url": "https://vlist.in/district/632.html",
        "taluks": {
            "Coimbatore North": ["Athipalayam", "Chinnavedampatti", "Ganapathy", "Idikarai", "Kavundampalayam", "Kurudampalayam", "Narasimhanaickenpalayam", "Periyanaickenpalayam", "Saravanampatti", "Sarcarsamakulam", "Thudiyalur", "Veerapandi"],
            "Coimbatore South": ["Chettipalayam", "Ettimadai", "Kuniyamuthur", "Kovaipudur", "Madukkarai", "Malumichampatti", "Othakalmandapam", "Perur", "Sundarapuram", "Thondamuthur", "Vadavalli", "Vellalore"],
            "Pollachi": ["Anaimalai", "Achipatti", "Gomangalampudur", "Kollampatti", "Kottur", "Negamam", "Pollachi (M)", "Samathur", "Suleeswaranpatti", "Vettaikaranpudur"],
            "Mettupalayam": ["Bhavani Sagar", "Jothipuram", "Karamadai", "Mettupalayam (M)", "Odanthurai", "Sirumugai", "Velliangadu"]
        }
    },
    "Cuddalore": {
        "code": "617",
        "url": "https://vlist.in/district/617.html",
        "taluks": {
            "Cuddalore": ["Alapakkam", "Bandipalayam", "Cuddalore (M)", "Gundu Uppalavadi", "Kapiyampuliyur", "Kottakuppam", "Manjakuppam", "Nellikuppam", "Pachayankuppam", "Pathirikuppam", "Reddiyarapalayam", "Thirupapuliyur", "Vandipalayam"],
            "Chidambaram": ["Annamalai Nagar", "Bhuvanagiri", "Chidambaram (M)", "Killai", "Kothattai", "Lalpettai", "Parangipettai", "Pichavaram", "Porto Novo", "Sethiathoppu"],
            "Panruti": ["Anguchettipalayam", "Elamangalam", "Kadampuliyur", "Karunguzhi", "Kondamur", "Marungur", "Nellikuppam", "Panruti (M)", "Pudupet", "Thorapadi", "Visoor"],
            "Vriddhachalam": ["Aladi", "Asanur", "Elavanasur", "Mangalampet", "Pennadam", "Sitheri", "T.V. Nallur", "Veepur", "Vriddhachalam (M)"]
        }
    },
    "Dharmapuri": {
        "code": "630",
        "url": "https://vlist.in/district/630.html",
        "taluks": {
            "Dharmapuri": ["Adagapadi", "Adiyamankottai", "Bharathipuram", "Dharmapuri (M)", "Hogenakkal", "Indur", "Kadagathur", "Kariyamangalam", "Nallampalli", "Pennagaram", "Sogathur", "Vennampatti"],
            "Harur": ["Achalwadi", "Bairnayakanpatti", "Harur (M)", "Kambainallur", "Kokkarapatti", "Kottapatti", "Morappur", "Pappireddipatti", "Tenkaraikottai", "Theerthamalai"]
        }
    },
    "Dindigul": {
        "code": "612",
        "url": "https://vlist.in/district/612.html",
        "taluks": {
            "Dindigul West": ["Agaram", "Adiyanuthu", "Balakrishnapuram", "Chettinaickenpatti", "Dindigul (M)", "Kannivadi", "Moolanur", "Reddiarchatram", "Sirumalai", "Thadicombu"],
            "Kodaikanal": ["Attuvampatti", "Kodaikanal (M)", "Kookal", "Mannavanur", "Poombarai", "Pannaikadu", "Shenbaganur", "Vattavada", "Vilpatti"],
            "Palani": ["Ayakudi", "Balasamudram", "Neikarapatti", "Oddanchatram", "Palani (M)", "Pappampatti", "Swaminathapuram", "Thoppampatti"]
        }
    },
    "Erode": {
        "code": "610",
        "url": "https://vlist.in/district/610.html",
        "taluks": {
            "Erode": ["Avalpoondurai", "Bhavani", "Chithode", "Erode (M)", "Kanjikoil", "Kasipalayam", "Kollankoil", "Modakurichi", "Perundurai", "Solar", "Surampatti", "Vellode"],
            "Gobichettipalayam": ["Anthiyur", "Bhavanisagar", "Elathur", "Gobichettipalayam (M)", "Kavindapadi", "Kullampalayam", "Lakkampatti", "Nambiyur", "Pariyur", "Sathyamangalam (M)"]
        }
    },
    "Kallakurichi": {
        "code": "607A",
        "url": "https://vlist.in/district/607.html",
        "taluks": {
            "Kallakurichi": ["Chinnasalem", "Emaper", "Kachirapalayam", "Kallakurichi (M)", "Kalrayan Hills", "Manalurpet", "Rishivandiyam", "Sankarapuram", "Tirukoilur", "Ulundurpet"]
        }
    },
    "Kanchipuram": {
        "code": "604",
        "url": "https://vlist.in/district/604.html",
        "taluks": {
            "Kanchipuram": ["Damal", "Enathur", "Kanchipuram (M)", "Nathapettai", "Orikkai", "Periya Kanchipuram", "Salavakkam", "Sevilimedu", "Tirupukuzhi", "Walajabad"],
            "Sriperumbudur": ["Irunattukottai", "Katrambakkam", "Mambakkam", "Mathur", "Nemili", "Oragadam", "Pillaipakkam", "Sriperumbudur (M)", "Sunguvarchatram", "Vallam"]
        }
    },
    "Kanyakumari": {
        "code": "629",
        "url": "https://vlist.in/district/629.html",
        "taluks": {
            "Agasteeswaram": ["Agasteeswaram", "Kanyakumari (M)", "Kottaram", "Nagercoil (M)", "Suchindram", "Theroor", "Vadasery"],
            "Thuckalay": ["Colachel", "Eraniel", "Kalkulam", "Padmanabhapuram", "Thuckalay (M)", "Villukuri"]
        }
    },
    "Karur": {
        "code": "613",
        "url": "https://vlist.in/district/613.html",
        "taluks": {
            "Karur": ["Andankoil", "Aravakurichi", "Inam Karur", "Karur (M)", "Krishnarayapuram", "Kulithalai", "Nangavaram", "Pasupathipalayam", "Punjaipugalur", "Thanthoni", "Vellianai"]
        }
    },
    "Krishnagiri": {
        "code": "631",
        "url": "https://vlist.in/district/631.html",
        "taluks": {
            "Hosur": ["Bagalur", "Bargur", "Denkanikottai", "Hosur (M)", "Juzuvadi", "Mathigiri", "Mornapalli", "Nallur", "SIPCOT Industrial Complex", "Zuzuvadi"],
            "Krishnagiri": ["Bargur", "Kaveripattinam", "Kelamangalam", "Krishnagiri (M)", "Maharajakadai", "Pochampalli", "Rayakottai", "Uthangarai"]
        }
    },
    "Madurai": {
        "code": "623",
        "url": "https://vlist.in/district/623.html",
        "taluks": {
            "Madurai North": ["Alanganallur", "Anaiyur", "Koodal Nagar", "Othakadai", "Paravai", "Samayanallur", "Sikkandar Chavadi", "Tallakulam", "Thirupalai", "Vadipatti"],
            "Madurai South": ["Avaniyapuram", "Harveypatti", "K.Pudur", "Madurai (M)", "Melur", "Palanganatham", "Thiruparankundram", "Tirumangalam", "Usilampatti", "Villaripatti"]
        }
    },
    "Mayiladuthurai": {
        "code": "618A",
        "url": "https://vlist.in/district/618.html",
        "taluks": {
            "Mayiladuthurai": ["Kollidam", "Kuttalam", "Manalmedu", "Mayiladuthurai (M)", "Poompuhar", "Sirkali", "Tharangambadi", "Tranquebar"]
        }
    },
    "Nagapattinam": {
        "code": "618",
        "url": "https://vlist.in/district/618.html",
        "taluks": {
            "Nagapattinam": ["Kilvelur", "Nagore", "Nagapattinam (M)", "Orathur", "Velankanni", "Vedaranyam", "Voimedu"]
        }
    },
    "Namakkal": {
        "code": "609",
        "url": "https://vlist.in/district/609.html",
        "taluks": {
            "Namakkal": ["Erumaipatti", "Kolli Hills", "Mohanur", "Namakkal (M)", "Puduchatram", "Rasipuram", "Sendamangalam", "Valavanthi"],
            "Tiruchengodu": ["Elachipalayam", "Komarapalayam", "Mallasamudram", "Pallipalayam", "Paramathi-Velur", "Tiruchengodu (M)"]
        }
    },
    "Nilgiris": {
        "code": "611",
        "url": "https://vlist.in/district/611.html",
        "taluks": {
            "Udhagamandalam (Ooty)": ["Coonoor (M)", "Gudalur (M)", "Kotagiri", "Ketti", "Lovedale", "Manjoor", "Ooty (M)", "Wellington"]
        }
    },
    "Perambalur": {
        "code": "615",
        "url": "https://vlist.in/district/615.html",
        "taluks": {
            "Perambalur": ["Alathur", "Chettikulam", "Kurumbalur", "Labbaikudikadu", "Perambalur (M)", "Poolambadi", "Veppanthattai"]
        }
    },
    "Pudukkottai": {
        "code": "621",
        "url": "https://vlist.in/district/621.html",
        "taluks": {
            "Pudukkottai": ["Alangudi", "Aranthangi (M)", "Avudaiyarkoil", "Gandarvakottai", "Illuppur", "Karambakudi", "Keeranur", "Manamelkudi", "Ponnamaravathi", "Pudukkottai (M)", "Thirumayam"]
        }
    },
    "Ramanathapuram": {
        "code": "626",
        "url": "https://vlist.in/district/626.html",
        "taluks": {
            "Ramanathapuram": ["Abiramam", "Kamuthi", "Kilakarai", "Mudukulathur", "Paramakudi (M)", "Ramanathapuram (M)", "Rameswaram (M)", "Sayalgudi", "Tiruvadanai"]
        }
    },
    "Ranipet": {
        "code": "605A",
        "url": "https://vlist.in/district/605.html",
        "taluks": {
            "Ranipet": ["Arakkonam (M)", "Arcot (M)", "Kaveripakkam", "Nemili", "Panapakkam", "Ranipet (M)", "SIPCOT Ranipet", "Sholinghur", "Walajah (M)"]
        }
    },
    "Salem": {
        "code": "608",
        "url": "https://vlist.in/district/608.html",
        "taluks": {
            "Salem": ["Attur (M)", "Gangavalli", "Idappadi (M)", "Jalarpet", "Kadayampatti", "Kannankurichi", "Karuppur", "Mettur (M)", "Omalur", "Salem (M)", "Sankari", "Thammampatti", "Valapady", "Yercaud"]
        }
    },
    "Sivaganga": {
        "code": "622",
        "url": "https://vlist.in/district/622.html",
        "taluks": {
            "Sivaganga": ["Devakottai (M)", "Ilayangudi", "Kalaiyarkoil", "Karaikudi (M)", "Manamadurai", "Sivaganga (M)", "Singampunari", "Thirupuvanam"]
        }
    },
    "Tenkasi": {
        "code": "628A",
        "url": "https://vlist.in/district/628.html",
        "taluks": {
            "Tenkasi": ["Alangulam", "Kadayanallur (M)", "Peraiyur", "Sankarankovil (M)", "Shenkottai (M)", "Surandai", "Tenkasi (M)", "Vasudevanallur", "Veeravanallur"]
        }
    },
    "Thanjavur": {
        "code": "620",
        "url": "https://vlist.in/district/620.html",
        "taluks": {
            "Thanjavur": ["Budalur", "Kumbakonam (M)", "Orathanadu", "Papanasam", "Pattukkottai (M)", "Peravurani", "Thanjavur (M)", "Thiruvaiyaru", "Thiruvidaimarudur"]
        }
    },
    "Theni": {
        "code": "624",
        "url": "https://vlist.in/district/624.html",
        "taluks": {
            "Theni": ["Andipatti", "Bodinayakanur (M)", "Cumbum (M)", "Devadanapatti", "Periyakulam (M)", "Theni Allinagaram (M)", "Uthamapalayam", "Veerapandi"]
        }
    },
    "Thiruvallur": {
        "code": "602",
        "url": "https://vlist.in/district/602.html",
        "taluks": {
            "Thiruvallur": ["Ambattur", "Avadi (M)", "Gummidipoondi", "Kadambathur", "Minjur", "Poonamallee (M)", "Ponneri", "Rk Pet", "Sholinghur", "Thiruthani (M)", "Thiruvallur (M)", "Uthukottai"]
        }
    },
    "Thiruvarur": {
        "code": "619",
        "url": "https://vlist.in/district/619.html",
        "taluks": {
            "Thiruvarur": ["Kudavasal", "Mannargudi (M)", "Nannilam", "Needamangalam", "Thiruthuraipoondi (M)", "Thiruvarur (M)", "Valangaiman"]
        }
    },
    "Thoothukudi": {
        "code": "627",
        "url": "https://vlist.in/district/627.html",
        "taluks": {
            "Thoothukudi": ["Eral", "Ettayapuram", "Kayathar", "Kovilpatti (M)", "Ottapidaram", "Sathankulam", "Srivaikuntam", "Thoothukudi (M)", "Tiruchendur", "Vilathikulam"]
        }
    },
    "Tiruchirappalli": {
        "code": "614",
        "url": "https://vlist.in/district/614.html",
        "taluks": {
            "Tiruchirappalli": ["Kattuputhur", "Lalgudi", "Manachanallur", "Manapparai (M)", "Musiri", "Navalpattu", "Srirangam", "Thottiyam", "Thuraiyur (M)", "Tiruchirappalli (M)", "Tiruverumbur"]
        }
    },
    "Tirunelveli": {
        "code": "628",
        "url": "https://vlist.in/district/628.html",
        "taluks": {
            "Tirunelveli": ["Ambasamudram (M)", "Cheranmahadevi", "Manur", "Nanguneri", "Palayamkottai", "Radhapuram", "Tirunelveli (M)", "Vikramasingapuram"]
        }
    },
    "Tirupathur": {
        "code": "605B",
        "url": "https://vlist.in/district/605.html",
        "taluks": {
            "Tirupathur": ["Ambur (M)", "Jolarpettai", "Natrampalli", "Tirupathur (M)", "Vaniyambadi (M)", "Yelagiri"]
        }
    },
    "Tiruppur": {
        "code": "633",
        "url": "https://vlist.in/district/633.html",
        "taluks": {
            "Tiruppur": ["Avinashi", "Dharapuram (M)", "Kangeyam (M)", "Madathukulam", "Palladam (M)", "Tiruppur North", "Tiruppur South", "Udumalaipettai (M)", "Uthukuli"]
        }
    },
    "Tiruvannamalai": {
        "code": "606",
        "url": "https://vlist.in/district/606.html",
        "taluks": {
            "Tiruvannamalai": ["Arani (M)", "Chengam", "Chetpet", "Cheyyar (M)", "Jamunamarathoor", "Kalasapakkam", "Kilpennathur", "Polur", "Thandarampattu", "Tiruvannamalai (M)", "Vandavasi (M)"]
        }
    },
    "Vellore": {
        "code": "605",
        "url": "https://vlist.in/district/605.html",
        "taluks": {
            "Vellore": ["Anaicut", "Gudiyatham (M)", "K V Kuppam", "Katpadi", "Pernambut (M)", "Sathuvachari", "Thorapadi", "Vellore (M)"]
        }
    },
    "Viluppuram": {
        "code": "607",
        "url": "https://vlist.in/district/607.html",
        "taluks": {
            "Viluppuram": ["Gingee", "Kandamangalam", "Kottakuppam", "Marakkanam", "Tindivanam (M)", "Vanur", "Vikravandi", "Viluppuram (M)"]
        }
    },
    "Virudhunagar": {
        "code": "625",
        "url": "https://vlist.in/district/625.html",
        "taluks": {
            "Virudhunagar": ["Aruppukkottai (M)", "Kariapatti", "Rajapalayam (M)", "Sattur (M)", "Sivakasi (M)", "Srivilliputhur (M)", "Tiruchuli", "Vembakottai", "Virudhunagar (M)"]
        }
    }
}

def create_database():
    print("Creating SQLite Database at:", DB_PATH)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE districts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        code TEXT,
        vlist_url TEXT,
        state TEXT DEFAULT 'Tamil Nadu'
    );
    """)

    cursor.execute("""
    CREATE TABLE sub_districts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        district_name TEXT NOT NULL,
        FOREIGN KEY (district_name) REFERENCES districts (name)
    );
    """)

    cursor.execute("""
    CREATE TABLE villages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        district_name TEXT NOT NULL,
        sub_district_name TEXT NOT NULL,
        vlist_url TEXT
    );
    """)

    cursor.execute("CREATE INDEX idx_villages_name ON villages(name);")
    cursor.execute("CREATE INDEX idx_villages_district ON villages(district_name);")
    cursor.execute("CREATE INDEX idx_villages_sub_district ON villages(sub_district_name);")

    total_districts = len(TAMIL_NADU_DATA)
    total_taluks = 0
    total_villages = 0
    json_villages = []

    for dist_name, dist_info in TAMIL_NADU_DATA.items():
        cursor.execute(
            "INSERT INTO districts (name, code, vlist_url, state) VALUES (?, ?, ?, 'Tamil Nadu')",
            (dist_name, dist_info['code'], dist_info['url'])
        )

        for taluk_name, village_list in dist_info['taluks'].items():
            total_taluks += 1
            cursor.execute(
                "INSERT INTO sub_districts (name, district_name) VALUES (?, ?)",
                (taluk_name, dist_name)
            )

            for v_name in village_list:
                total_villages += 1
                v_url = f"{dist_info['url']}#{v_name.lower().replace(' ', '-')}"
                cursor.execute(
                    "INSERT INTO villages (name, district_name, sub_district_name, vlist_url) VALUES (?, ?, ?, ?)",
                    (v_name, dist_name, taluk_name, v_url)
                )
                json_villages.append({
                    "name": v_name,
                    "district": dist_name,
                    "sub_district": taluk_name,
                    "url": v_url
                })

    conn.commit()
    conn.close()

    print(f"Database created successfully!")
    print(f"- Districts: {total_districts}")
    print(f"- Taluks/Sub-districts: {total_taluks}")
    print(f"- Total Villages Loaded: {total_villages}")

    # Export to JSON
    json_export = {
        "state": "Tamil Nadu",
        "source": "https://vlist.in/state/33.html",
        "total_districts": total_districts,
        "total_sub_districts": total_taluks,
        "total_villages": total_villages,
        "districts": list(TAMIL_NADU_DATA.keys()),
        "villages": json_villages
    }

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(json_export, f, ensure_ascii=False, indent=2)

    print(f"JSON export created successfully at {JSON_PATH}")

if __name__ == '__main__':
    create_database()
