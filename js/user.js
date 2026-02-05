// User State Management
const UserState = {
    name: "Alex Volunteer",
    location: "Oklahoma City",
    skills: ["Teamwork"],
    totalHours: 0, // Default to 0
    events: [], // IDs of active signups
    completedEvents: [], // IDs of past events
    badges: [],

    init() {
        // Load from local storage if valid, else default
        const saved = localStorage.getItem('volunteer_user');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.name = parsed.name || "Alex Volunteer";
            this.location = parsed.location || "Oklahoma City, OK";
            this.skills = parsed.skills || ["Teamwork"];
            this.events = parsed.events || [];
            this.completedEvents = parsed.completedEvents || [];
            // Strictly derive hours from completed events (4 hours per event)
            this.totalHours = this.completedEvents.length * 4;
            this.badges = parsed.badges || [];
        }
    },

    save() {
        localStorage.setItem('volunteer_user', JSON.stringify({
            name: this.name,
            location: this.location,
            skills: this.skills,
            totalHours: this.totalHours,
            events: this.events,
            completedEvents: this.completedEvents,
            badges: this.badges
        }));
    },

    updateProfile(name, location, skills) {
        this.name = name;
        this.location = location;
        this.skills = skills;
        this.save();
    },

    signUp(eventId) {
        // Check both active and completed to prevent duplicate
        if (this.events.includes(eventId) || this.completedEvents.includes(eventId)) return false;

        this.events.push(eventId);
        // NO hours added on signup anymore
        window.DataStore.updateSpots(eventId, 1);

        this.save();
        return true;
    },

    cancelSignUp(eventId) {
        const idx = this.events.indexOf(eventId);
        if (idx === -1) return false;

        this.events.splice(idx, 1);
        window.DataStore.updateSpots(eventId, -1);

        this.save();
        return true;
    },

    completeEvent(eventId) {
        const idx = this.events.indexOf(eventId);
        if (idx === -1) return false;

        // Move from active to completed
        this.events.splice(idx, 1);
        this.completedEvents.push(eventId);

        // Add Hours (4 hours per event)
        this.totalHours += 4;

        // Badge Logic
        const totalDone = this.completedEvents.length;
        if (totalDone >= 1 && !this.badges.find(b => b.id === 1)) {
            this.badges.push({ id: 1, name: "First Step", icon: "👟", desc: "Completed 1st Event" });
        }
        if (totalDone >= 3 && !this.badges.find(b => b.id === 2)) {
            this.badges.push({ id: 2, name: "Hat Trick", icon: "🎩", desc: "3 Events Completed" });
        }
        if (totalDone >= 5 && !this.badges.find(b => b.id === 3)) {
            this.badges.push({ id: 3, name: "Super Star", icon: "⭐", desc: "5 Events Completed" });
        }

        this.save();
        return true;
    },

    getEventDetails(allEvents) {
        return {
            active: allEvents.filter(e => this.events.includes(e.id)),
            completed: allEvents.filter(e => this.completedEvents.includes(e.id))
        };
    }
};

window.UserState = UserState;
