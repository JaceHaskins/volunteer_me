document.addEventListener('DOMContentLoaded', () => {
    // Init User
    window.UserState.init();

    // DOM Elements
    const grid = document.getElementById('opp-grid');
    const dashboardGrid = document.getElementById('dashboard-grid');
    const filterContainer = document.getElementById('filters');

    // Router Logic
    const views = {
        home: document.getElementById('view-home'),
        dashboard: document.getElementById('view-dashboard'),
        nonprofit: document.getElementById('view-nonprofit')
    };

    window.router = {
        navigate(viewName) {
            Object.values(views).forEach(el => {
                if (el) el.classList.remove('active');
            });
            if (views[viewName]) {
                views[viewName].classList.add('active');
                window.scrollTo(0, 0);
            }

            if (viewName === 'dashboard') {
                renderDashboard();
            }
            if (viewName === 'home') {
                refreshHome();
            }
        }
    };

    // --- RENDER LOGIC ---

    // 1. Filters
    const categories = ['All', 'Recommended', 'Hunger Relief', 'Animals', 'Housing', 'Education', 'Environment', 'Community'];

    function initFilters() {
        filterContainer.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `filter-chip ${cat === 'Recommended' ? 'recommended-chip' : ''}`;
            if (cat === 'Recommended') btn.innerHTML = '✨ Recommended';
            else btn.innerText = cat;

            // Add ID for targeting
            btn.dataset.category = cat;

            btn.onclick = () => filterData(cat, btn);
            filterContainer.appendChild(btn);
        });
    }
    initFilters();

    // 2. Refresh Home Logic
    function refreshHome() {
        // Smart Default
        const storedUser = localStorage.getItem('volunteer_user');
        let defaultFilter = 'All';

        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            // If user has specific location/skills, default to Recommended
            if (parsed.location || (parsed.skills && parsed.skills.length > 0)) {
                defaultFilter = 'Recommended';
            }
        }

        // Trigger click on correct button
        const targetBtn = Array.from(filterContainer.children).find(b => b.dataset.category === defaultFilter);
        if (targetBtn) {
            filterData(defaultFilter, targetBtn);
        } else {
            // Fallback
            filterData('All', filterContainer.children[0]);
        }
    }

    // Initial Load
    refreshHome();


    function renderCards(data, container, mode = 'normal') {
        // mode: 'normal' (home), 'active' (dashboard active), 'completed' (dashboard history)
        if (mode === 'normal') container.innerHTML = '';

        if (data.length === 0 && mode === 'normal') {
            container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:#94a3b8;">No opportunities found matching your criteria.</div>`;
            return;
        }

        data.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'card fade-in';
            card.style.animationDelay = `${index * 0.05}s`;
            if (mode === 'completed') card.style.opacity = '0.7'; // Fade out completed items

            // Calculate progress
            const percent = Math.round((item.spots_filled / item.spots_total) * 100);
            const skillsHtml = (item.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('');

            // Highlight location match
            const isNear = window.UserState.location && item.location.toLowerCase().includes(window.UserState.location.toLowerCase());

            // Determine Buttons
            let actionBtn = `<button class="btn btn-primary btn-card" onclick="openModal(${item.id})">View Details</button>`;

            if (mode === 'active') {
                actionBtn = `
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-top:auto;">
                        <button class="btn btn-primary" onclick="window.completeEvent(${item.id})" style="width:100%; font-size:0.9rem;">My Check-in</button>
                        <button class="btn btn-danger-outline" onclick="window.cancelEvent(${item.id})" style="width:100%; font-size:0.9rem;">Cancel</button>
                    </div>`;
            } else if (mode === 'completed') {
                actionBtn = `<button class="btn btn-outline btn-card" disabled style="border-color:#cbd5e1; color:#94a3b8; width:100%; cursor:default;">Completed ✅</button>`;
            }

            card.innerHTML = `
                <div class="card-img" style="background-image: url('${item.image}')">
                    <span class="category-tag">${item.category}</span>
                    ${isNear ? '<span style="position:absolute; bottom:1rem; right:1rem; background:var(--primary); color:white; padding:0.25rem 0.5rem; border-radius:4px; font-size:0.75rem; font-weight:bold;">📍 Near You</span>' : ''}
                </div>
                <div class="card-body">
                    <div class="org-name">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l8-4 8 4v14M10 9a3 3 0 100-6 3 3 0 000 6v0"/></svg>
                         ${item.org}
                    </div>
                    <h3 class="card-title">${item.title}</h3>
                    <div class="card-meta">
                        <div class="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            ${item.location}
                        </div>
                    </div>
                    
                    <div style="margin-bottom:1rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#64748B; margin-bottom:0.25rem;">
                            <span>Spots Filled</span>
                            <span>${item.spots_filled}/${item.spots_total}</span>
                        </div>
                        <div class="progress-container" style="height:4px;">
                            <div class="progress-bar" style="width: ${percent}%; background-color: ${percent > 90 ? '#ef4444' : 'var(--primary)'}"></div>
                        </div>
                    </div>

                    <div class="skills-list" style="margin-top:0; margin-bottom:1rem;">
                        ${skillsHtml}
                    </div>

                    ${actionBtn}
                </div>
            `;
            container.appendChild(card);
        });
    }

    function filterData(category, btnElement) {
        document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
        if (btnElement) btnElement.classList.add('active');

        const allData = window.DataStore.getAll();

        if (category === 'All') {
            renderCards(allData, grid);
        }
        else if (category === 'Recommended') {
            // Recommendation Logic
            const userLoc = (window.UserState.location || "").toLowerCase();
            const userSkills = (window.UserState.skills || []).map(s => s.toLowerCase());

            const recs = allData.filter(d => {
                const locMatch = d.location.toLowerCase().includes(userLoc);
                const skillMatch = d.skills && d.skills.some(s => userSkills.includes(s.toLowerCase()));
                return locMatch || skillMatch;
            });

            // Sort by match quality (both > loc > skill)
            recs.sort((a, b) => {
                const aLoc = a.location.toLowerCase().includes(userLoc);
                const bLoc = b.location.toLowerCase().includes(userLoc);
                return bLoc - aLoc;
            });

            renderCards(recs, grid);
        }
        else {
            const filtered = allData.filter(d => d.category === category);
            renderCards(filtered, grid);
        }
    }

    // --- DASHBOARD LOGIC ---
    function renderDashboard() {
        // Update Header Name (Dynamic Welcome)
        document.getElementById('user-welcome-name').innerText = window.UserState.name.split(' ')[0];

        // Update Stats
        document.getElementById('user-hours').innerText = window.UserState.totalHours;
        document.getElementById('user-impact').innerText = window.UserState.completedEvents.length;

        // Populate Profile Inputs
        document.getElementById('profile-name').value = window.UserState.name;
        document.getElementById('profile-location').value = window.UserState.location;
        document.getElementById('profile-skills').value = window.UserState.skills.join(', ');

        // Render Badges
        const badgeContainer = document.getElementById('user-badges');
        badgeContainer.innerHTML = window.UserState.badges.map(b => `
            <div class="badge" title="${b.desc}">${b.icon} ${b.name}</div>
        `).join('');

        // Render Events
        const userEvents = window.UserState.getEventDetails(window.DataStore.getAll());

        dashboardGrid.innerHTML = '';

        // Active Events Section
        if (userEvents.active.length > 0) {
            renderCards(userEvents.active, dashboardGrid, 'active');
        } else {
            dashboardGrid.innerHTML += `<div style="grid-column:1/-1; padding:2rem; text-align:center; color:#94a3b8; border: 2px dashed #e2e8f0; border-radius:1rem; margin-bottom:2rem;">No active shifts. Sign up for one!</div>`;
        }

        // Past History Section
        const historyTitle = document.createElement('h3');
        historyTitle.style.gridColumn = "1/-1";
        historyTitle.style.marginTop = "1rem";
        historyTitle.style.color = "#64748B";
        historyTitle.style.borderBottom = "1px solid #e2e8f0";
        historyTitle.style.paddingBottom = "0.5rem";
        historyTitle.innerText = "Past History";
        dashboardGrid.appendChild(historyTitle);

        // New Grid for History
        const historyGrid = document.createElement('div');
        historyGrid.className = 'opp-grid'; // Use same grid layout class
        historyGrid.style.gridColumn = "1/-1";
        historyGrid.style.display = "grid"; // Re-assert grid
        historyGrid.style.gridTemplateColumns = "repeat(auto-fill, minmax(300px, 1fr))";
        historyGrid.style.gap = "2rem";
        dashboardGrid.appendChild(historyGrid);

        if (userEvents.completed.length > 0) {
            renderCards(userEvents.completed, historyGrid, 'completed');
        } else {
            historyGrid.innerHTML = `<div style="grid-column:1/-1; color:#94a3b8; font-style:italic;">No past events yet.</div>`;
        }
    }

    window.saveProfile = () => {
        const name = document.getElementById('profile-name').value;
        const loc = document.getElementById('profile-location').value;
        const skillsStr = document.getElementById('profile-skills').value;
        const skills = skillsStr.split(',').map(s => s.trim()).filter(s => s);

        window.UserState.updateProfile(name, loc, skills);

        // Instant update of header
        document.getElementById('user-welcome-name').innerText = name.split(' ')[0];

        alert("Profile Updated! Your Home Feed is now optimized for " + loc);
    }

    window.cancelEvent = (id) => {
        if (confirm("Are you sure you want to cancel this signup?")) {
            window.UserState.cancelSignUp(id);
            renderDashboard();
        }
    }

    window.completeEvent = (id) => {
        if (confirm("Confirm that you completed this volunteer shift? Hours will be added.")) {
            window.UserState.completeEvent(id);
            renderDashboard();
            // Celebration
            alert("Great job! Hours added to your profile.");
        }
    }

    window.loadMoreEvents = () => {
        const userLoc = window.UserState.location;
        // Generate more data - strictly preferring userLoc
        const newEvents = window.DataStore.generateMore(6, userLoc);

        // Refresh Current View
        const activeBtn = document.querySelector('.filter-chip.active');
        const category = activeBtn ? activeBtn.dataset.category : 'All';

        if (category) {
            filterData(category, activeBtn);
        } else {
            window.router.navigate('home');
        }
    }

    // --- NON-PROFIT LOGIC ---
    window.createPost = () => {
        const org = document.getElementById('post-org').value;
        const title = document.getElementById('post-title').value;
        const cat = document.getElementById('post-category').value;
        const loc = document.getElementById('post-location').value;
        const date = document.getElementById('post-date').value;
        const desc = document.getElementById('post-desc').value;
        const impact = document.getElementById('post-impact').value;
        const spots = parseInt(document.getElementById('post-spots').value);

        const fileInput = document.getElementById('post-image');

        // Strict Validation
        if (!org || !title || !cat || !loc || !date || !desc || !impact || isNaN(spots) || !fileInput.files[0]) {
            alert("Please fill out ALL fields, including the image, to post an opportunity.");
            return;
        }

        // Base function to finish post
        const finishPost = (imgUrl) => {
            window.DataStore.addPost({
                title: title,
                org: org,
                category: cat,
                location: loc,
                date: date,
                description: desc,
                impact: impact,
                spots_total: spots,
                skills: ["Community"],
                image: imgUrl
            });

            alert("Opportunity posted successfully! Redirecting to home feed...");
            document.getElementById('post-form').reset();
            window.router.navigate('home');
        };

        const reader = new FileReader();
        reader.onload = function (e) {
            finishPost(e.target.result);
        }
        reader.readAsDataURL(fileInput.files[0]);
    }

    // --- MODAL LOGIC ---
    const modal = document.getElementById('modal-overlay');
    let currentEventId = null;

    window.openModal = (id) => {
        const item = window.DataStore.getAll().find(d => d.id === id);
        if (!item) return;
        currentEventId = id;

        // Reset Form
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('modal-actions').style.display = 'flex';

        // Populate Data
        document.getElementById('modal-title').innerText = item.title;
        document.getElementById('modal-org').innerText = item.org;
        document.getElementById('modal-desc').innerText = item.description;
        document.getElementById('modal-impact').innerText = item.impact;

        // Date & Time
        document.getElementById('modal-date').innerText = item.date;
        const timeStr = item.startTime ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Time TBD";
        const timeEl = document.getElementById('modal-time');
        if (timeEl) timeEl.innerText = timeStr;

        // Progress

        // Progress
        document.getElementById('modal-spots-text').innerText = `${item.spots_filled} / ${item.spots_total} spots filled`;
        const percent = (item.spots_filled / item.spots_total) * 100;
        document.getElementById('modal-progress').style.width = `${percent}%`;

        modal.classList.add('open');
    }

    window.showSignUpForm = () => {
        document.getElementById('modal-actions').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    }

    window.confirmSignUp = () => {
        const name = document.getElementById('input-name').value;
        if (!name) { alert("Please enter your name"); return; }

        // Update User State
        const success = window.UserState.signUp(currentEventId);

        if (success) {
            alert(`Awesome ${name}! You are signed up. Check your Dashboard.`);
            closeModal();
            window.router.navigate('dashboard');
        } else {
            alert("You are already signed up or verified for this event!");
        }
    }

    window.closeModal = () => {
        modal.classList.remove('open');
    }

    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    }
});
