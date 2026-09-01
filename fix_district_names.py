import json

# Official Tamil Nadu district names from vlist.in/state/33.html
# These are the census-based district names
VLIST_DISTRICTS = {
    "Ariyalur", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul",
    "Erode", "Kancheepuram", "Kanniyakumari", "Karur", "Krishnagiri",
    "Madurai", "Nagapattinam", "Namakkal", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "The Nilgiris",
    "Theni", "Thiruvallur", "Thiruvarur", "Thoothukkudi", "Tiruchirappalli",
    "Tirunelveli", "Tiruppur", "Tiruvannamalai", "Vellore", "Viluppuram",
    "Virudhunagar"
}

# Mapping from incorrect/spelled differently district names to official vlist.in names
DISTRICT_NAME_FIXES = {
    "Kanchipuram": "Kancheepuram",
    "Kanyakumari": "Kanniyakumari",
    "Nilgiris": "The Nilgiris",
    "Thoothukudi": "Thoothukkudi",
}

# Newer districts created from older ones (valid Tamil Nadu districts, not in vlist.in census data)
# These map to their parent districts in the census structure
NEWER_DISTRICTS_TO_PARENT = {
    "Chengalpattu": "Kancheepuram",
    "Chennai": "Thiruvallur",
    "Kallakurichi": "Viluppuram",
    "Mayiladuthurai": "Nagapattinam",
    "Ranipet": "Vellore",
    "Tenkasi": "Tirunelveli",
    "Tirupathur": "Vellore",
}

def fix_village_database():
    with open('village_database.json', 'r', encoding='utf-8') as f:
        villages = json.load(f)
    
    print(f"Loaded {len(villages)} villages")
    
    # Track changes
    changes = {}
    unmapped = set()
    
    for v in villages:
        old_district = v.get('district', '')
        
        # Apply direct name fixes
        if old_district in DISTRICT_NAME_FIXES:
            new_district = DISTRICT_NAME_FIXES[old_district]
            v['district'] = new_district
            v['state'] = 'Tamil Nadu'
            if old_district not in changes:
                changes[old_district] = {'count': 0, 'new_name': new_district}
            changes[old_district]['count'] += 1
        
        # Map newer districts to parent census districts
        elif old_district in NEWER_DISTRICTS_TO_PARENT:
            parent_district = NEWER_DISTRICTS_TO_PARENT[old_district]
            v['district'] = parent_district
            v['state'] = 'Tamil Nadu'
            if old_district not in changes:
                changes[old_district] = {'count': 0, 'new_name': parent_district}
            changes[old_district]['count'] += 1
        
        # Already correct or unknown
        else:
            v['state'] = 'Tamil Nadu'
            if old_district not in VLIST_DISTRICTS:
                unmapped.add(old_district)
    
    # Print summary
    print("\n=== District Name Fixes Applied ===")
    for old_name, info in sorted(changes.items()):
        print(f"  {old_name} -> {info['new_name']} ({info['count']} villages)")
    
    if unmapped:
        print(f"\n=== Unmapped Districts (not in vlist.in) ===")
        for d in sorted(unmapped):
            print(f"  {d}")
    
    # Count villages per district after fix
    district_counts = {}
    for v in villages:
        d = v['district']
        if d not in district_counts:
            district_counts[d] = 0
        district_counts[d] += 1
    
    print(f"\n=== Final District Counts (after fixes) ===")
    for d in sorted(district_counts.keys()):
        marker = " *" if d not in VLIST_DISTRICTS else ""
        print(f"  {d}: {district_counts[d]}{marker}")
    
    print(f"\n* = Not in vlist.in 31-district census structure")
    
    # Save fixed data
    with open('village_database.json', 'w', encoding='utf-8') as f:
        json.dump(villages, f, ensure_ascii=False, indent=2)
    
    print(f"\nSaved fixed village_database.json")

if __name__ == '__main__':
    fix_village_database()
