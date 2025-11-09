#!/usr/bin/env python3
"""
Learning Journal Reflection Entry Script
Allows adding new reflections to the reflections.json file
"""

import json
import os
from datetime import datetime

# Path to the JSON file
REFLECTIONS_FILE = os.path.join(os.path.dirname(__file__), 'reflections.json')


def load_reflections():
    """Load existing reflections from JSON file"""
    try:
        if os.path.exists(REFLECTIONS_FILE):
            with open(REFLECTIONS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error loading reflections: {e}")
        return []


def save_reflections(reflections):
    """Save reflections to JSON file"""
    try:
        with open(REFLECTIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(reflections, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving reflections: {e}")
        return False


def add_reflection():
    """Add a new reflection entry"""
    print("\n" + "="*60)
    print("✍️  Learning Journal - Add New Reflection")
    print("="*60 + "\n")
    
    # Get reflection title
    title = input("📝 Enter reflection title: ").strip()
    if not title:
        print("❌ Title cannot be empty!")
        return False
    
    # Get reflection content
    print("\n💭 Enter your reflection (press Enter twice to finish):")
    lines = []
    empty_count = 0
    while empty_count < 1:
        line = input()
        if line == "":
            empty_count += 1
        else:
            empty_count = 0
            lines.append(line)
    
    content = "\n".join(lines).strip()
    if not content:
        print("❌ Content cannot be empty!")
        return False
    
    # Get category/tags
    category = input("\n🏷️  Enter category (e.g., Python, JavaScript, APIs): ").strip()
    if not category:
        category = "General"
    
    # Get key learnings (optional)
    print("\n💡 Enter key learnings (one per line, press Enter on empty line to finish):")
    learnings = []
    while True:
        learning = input("  • ").strip()
        if not learning:
            break
        learnings.append(learning)
    
    # Create reflection entry
    entry = {
        "id": datetime.now().strftime("%Y%m%d%H%M%S"),
        "title": title,
        "content": content,
        "category": category,
        "learnings": learnings,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "timestamp": datetime.now().isoformat(),
        "formatted_date": datetime.now().strftime("%B %d, %Y")
    }
    
    # Load existing reflections
    reflections = load_reflections()
    
    # Add new entry at the beginning (most recent first)
    reflections.insert(0, entry)
    
    # Save to file
    if save_reflections(reflections):
        print("\n" + "="*60)
        print("✅ Reflection saved successfully!")
        print(f"📊 Total reflections: {len(reflections)}")
        print("="*60 + "\n")
        return True
    else:
        print("\n❌ Failed to save reflection!")
        return False


def view_reflections():
    """View all reflections"""
    reflections = load_reflections()
    
    if not reflections:
        print("\n📭 No reflections found yet!")
        return
    
    print("\n" + "="*60)
    print(f"📚 Learning Journal - {len(reflections)} Reflections")
    print("="*60 + "\n")
    
    for i, entry in enumerate(reflections, 1):
        print(f"{i}. 📝 {entry['title']}")
        print(f"   📅 {entry['formatted_date']}")
        print(f"   🏷️  {entry['category']}")
        if entry.get('learnings'):
            print(f"   💡 {len(entry['learnings'])} key learning(s)")
        print()


def main():
    """Main program loop"""
    while True:
        print("\n" + "="*60)
        print("📔 Learning Journal Manager")
        print("="*60)
        print("1. ➕ Add New Reflection")
        print("2. 📖 View All Reflections")
        print("3. 🚪 Exit")
        print("="*60)
        
        choice = input("\nSelect an option (1-3): ").strip()
        
        if choice == "1":
            add_reflection()
        elif choice == "2":
            view_reflections()
        elif choice == "3":
            print("\n👋 Goodbye! Keep learning!\n")
            break
        else:
            print("\n❌ Invalid option! Please choose 1-3.")


if __name__ == "__main__":
    main()
