// Helper for dates
const getRelDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d;
};

// Initial Data covering the US with Timestamps
let opportunities = [
    {
        id: 1,
        title: "Community Food Pantry Helper",
        org: "Austin Food Bank",
        category: "Hunger Relief",
        location: "Austin, TX",
        date: "Yesterday, 9am - 12pm",
        startTime: getRelDate(-1).getTime(), // Yesterday
        endTime: getRelDate(-1).getTime() + (3 * 60 * 60 * 1000), // Finished
        image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800",
        description: "Join us to sort and pack food boxes for families in need across central Texas. This is a high-energy, fun environment perfect for groups.",
        urgency: "High",
        skills: ["Teamwork", "Lifting"],
        spots_total: 20,
        spots_filled: 12,
        impact: "Provides 50 families with a week of meals"
    },
    {
        id: 2,
        title: "Urban Garden Maintenance",
        org: "NYC Green Thumbs",
        category: "Environment",
        location: "New York, NY",
        date: "Tomorrow, 10am - 2pm",
        startTime: getRelDate(1).getTime(), // Tomorrow
        endTime: getRelDate(1).getTime() + (4 * 60 * 60 * 1000), // Not finished
        image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800",
        description: "Help maintain our rooftop gardens in Brooklyn. Planting, weeding, and harvesting fresh produce for local shelters.",
        urgency: "Medium",
        skills: ["Outdoors", "Gardening"],
        spots_total: 10,
        spots_filled: 3,
        impact: "Harvests 200lbs of fresh produce"
    },
    {
        id: 3,
        title: "Home Build Day",
        org: "Habitat for Humanity Denver",
        category: "Housing",
        location: "Denver, CO",
        date: "Next Saturday, 8am - 3pm",
        startTime: getRelDate(7).getTime(), // Future
        endTime: getRelDate(7).getTime() + (7 * 60 * 60 * 1000),
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800",
        description: "Help build efficient, quality, affordable homes. No construction experience needed! We will teach you everything you need to know.",
        urgency: "High",
        skills: ["Carpentry", "Manual Labor"],
        spots_total: 15,
        spots_filled: 13,
        impact: "Builds a permanent home for a family"
    },
    {
        id: 4,
        title: "Coding Mentor for Teens",
        org: "Tech for Good SF",
        category: "Education",
        location: "San Francisco, CA",
        date: "Weekdays, 4pm - 6pm",
        startTime: getRelDate(2).getTime(), // Future
        endTime: getRelDate(2).getTime() + (2 * 60 * 60 * 1000),
        image: "https://images.unsplash.com/photo-1577896335477-28effe291f0f?auto=format&fit=crop&q=80&w=800",
        description: "Teach basic Python and web development to high school students from underrepresented communities.",
        urgency: "Low",
        skills: ["Teaching", "Coding"],
        spots_total: 5,
        spots_filled: 5,
        impact: "Empowers 10 students with career skills"
    },
    {
        id: 5,
        title: "Beach Cleanup Crew",
        org: "Save Our Shores",
        category: "Environment",
        location: "Miami, FL",
        date: "Yesterday, 8am - 11am",
        startTime: getRelDate(-1).getTime(),
        endTime: getRelDate(-1).getTime() + (3 * 60 * 60 * 1000), // Finished
        image: "https://images.unsplash.com/photo-1618477461853-5e8790b4d400?auto=format&fit=crop&q=80&w=800",
        description: "Help keep our beautiful beaches clean! We will provide bags, gloves, and grabbers. Bring water and sunscreen.",
        urgency: "High",
        skills: ["Outdoors", "Cleaning"],
        spots_total: 50,
        spots_filled: 45,
        impact: "Clears 500 lbs of plastic/litter"
    },
    {
        id: 6,
        title: "Senior Companion",
        org: "Chicago Cares",
        category: "Community",
        location: "Chicago, IL",
        date: "Today (Ends soon)",
        startTime: new Date().getTime() - 10000,
        endTime: new Date().getTime() + 10000000, // Ongoing/Future
        image: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=800",
        description: "Visit with seniors who are homebound. Read to them, play games, or just chat. A little companionship goes a long way.",
        urgency: "Medium",
        skills: ["Social", "Empathy"],
        spots_total: 10,
        spots_filled: 8,
        impact: "Reduces senior isolation"
    }
];

// Methods to interact with data
window.DataStore = {
    getAll: () => opportunities,

    addPost: (post) => {
        const newId = opportunities.length > 0 ? Math.max(...opportunities.map(o => o.id)) + 1 : 1;
        const now = new Date();
        const future = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // Default 1 week out

        const newPost = {
            id: newId,
            spots_filled: 0,
            image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800",
            startTime: future.getTime(),
            endTime: future.getTime() + (4 * 60 * 60 * 1000),
            ...post
        };
        opportunities.unshift(newPost); // Add to top
        return newPost;
    },

    updateSpots: (id, change) => {
        const item = opportunities.find(o => o.id === id);
        if (item) {
            item.spots_filled = Math.max(0, Math.min(item.spots_total, item.spots_filled + change));
        }
    },

    generateMore: (count = 6, userCity = null) => {
        const adjectives = ["Community", "Annual", "Weekend", "Emergency", "Youth", "Senior", "Neighborhood"];
        const nouns = ["Cleanup", "Fundraiser", "Mentoring", "Food Drive", "Build Day", "Shelter Help", "Garden Project"];
        const cities = ["Austin, TX", "Denver, CO", "New York, NY", "Chicago, IL", "Seattle, WA", "Miami, FL", "Tulsa, OK", "Los Angeles, CA", "Oklahoma City, OK", "Norman, OK"];

        const generated = [];
        const nextId = Math.max(...opportunities.map(o => o.id)) + 1;

        for (let i = 0; i < count; i++) {
            const loc = userCity ? userCity : cities[Math.floor(Math.random() * cities.length)];

            // Randomly assign dates (mostly future, some past for realism testing)
            const daysOffset = Math.floor(Math.random() * 14) - 2; // -2 to +12 days
            const start = getRelDate(daysOffset).getTime();

            generated.push({
                id: nextId + i,
                title: `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`,
                org: `Local Org (${loc.split(',')[0]})`,
                category: ["Community", "Environment", "Housing", "Hunger Relief"][Math.floor(Math.random() * 4)],
                location: loc,
                date: daysOffset < 0 ? "Past Event" : (daysOffset === 0 ? "Today" : "Upcomming"),
                startTime: start,
                endTime: start + (4 * 60 * 60 * 1000),
                image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800",
                description: `A fantastic opportunity to give back to the ${loc} community. We need passionate volunteers like you!`,
                urgency: "Medium",
                skills: ["General", "Helping Hand"],
                spots_total: 10 + Math.floor(Math.random() * 20),
                spots_filled: Math.floor(Math.random() * 10),
                impact: `Impacts the ${loc} area directly`
            });
        }

        opportunities = [...opportunities, ...generated];
        return generated;
    }
};

// Backwards compatibility for app.js init
window.MOCK_DATA = opportunities;
