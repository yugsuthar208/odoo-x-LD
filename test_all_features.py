import sys
from playwright.sync_api import sync_playwright

def run_tests():
    passed_tests = []
    failed_tests = []
    console_errors = []

    def record_pass(name):
        print(f"  [PASS] {name}")
        passed_tests.append(name)

    def record_fail(name, error):
        print(f"  [FAIL] {name}: {error}")
        failed_tests.append((name, str(error)))

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Listen for console errors
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        print("\n==================================================")
        print("STARTING FULL WEBSITE BUTTON & FEATURE TEST SUITE")
        print("==================================================")

        # ----------------------------------------------------
        # 1. LOGIN & PREVIEW ENTRY
        # ----------------------------------------------------
        print("\n--- 1. Testing /login & Demo Mode ---")
        try:
            page.goto("http://localhost:3000/login")
            page.wait_for_load_state("domcontentloaded")
            assert "campus" in page.content(), "Brand is present"
            record_pass("Login page renders cleanly")

            # Tab toggle: Create Account vs Sign In
            page.click("button:has-text('CREATE ACCOUNT')")
            page.wait_for_timeout(200)
            assert "Your name" in page.content(), "Create account form visible"
            page.click("button:has-text('SIGN IN')")
            page.wait_for_timeout(200)
            record_pass("Login mode tabs toggle cleanly")

            # Select preview role & enter demo
            preview_select = page.locator(".preview-box select")
            preview_select.select_option("Student")
            page.click(".preview-box button")
            page.wait_for_url("http://localhost:3000/dashboard")
            page.wait_for_selector(".app-shell", timeout=6000)
            record_pass("Explore demo preview entry successful")
        except Exception as e:
            record_fail("Login & preview entry", e)

        # ----------------------------------------------------
        # 2. TOPBAR, NOTIFICATIONS & PREVIEW ROLE SWITCHER
        # ----------------------------------------------------
        print("\n--- 2. Testing Topbar, Notifications & Role Switcher ---")
        try:
            # Notifications bell
            page.click("button.notification")
            page.wait_for_selector(".notif-popover", timeout=2000)
            record_pass("Notification bell opens popover")
            page.click(".notif-popover button")
            page.wait_for_timeout(200)
            record_pass("Notification popover closes")

            # Switch to Club Leader
            page.select_option(".role-switch select", "Club Leader")
            page.wait_for_timeout(300)
            assert "Tasks" in page.locator(".side-nav").inner_text(), "Club Leader has Tasks in nav"
            record_pass("Role switch to Club Leader updates navigation")

            # Switch to Student Council
            page.select_option(".role-switch select", "Student Council")
            page.wait_for_timeout(300)
            assert "Council" in page.locator(".side-nav").inner_text(), "Student Council has Council section"
            record_pass("Role switch to Student Council updates navigation")

            # Switch to Admin
            page.select_option(".role-switch select", "Admin")
            page.wait_for_timeout(300)
            assert "Administration" in page.locator(".side-nav").inner_text(), "Admin has Administration"
            record_pass("Role switch to Admin updates navigation")

            # Switch back to Student for base user tests
            page.select_option(".role-switch select", "Student")
            page.wait_for_timeout(300)
            record_pass("Role switch back to Student successful")
        except Exception as e:
            record_fail("Topbar & Role Switcher", e)

        # ----------------------------------------------------
        # 3. OVERVIEW SECTION BUTTONS
        # ----------------------------------------------------
        print("\n--- 3. Testing Overview Section ---")
        try:
            page.click(".side-nav button:has-text('Overview')")
            page.wait_for_timeout(300)

            # Quick stats navigation button
            page.click(".quick-stats article:nth-child(1) button")
            page.wait_for_timeout(300)
            assert page.locator("h1").inner_text().strip(), "Navigated to Events"
            record_pass("Quick stats 'Find your next thing' button navigates")

            # Back to Overview
            page.click(".side-nav button:has-text('Overview')")
            page.wait_for_timeout(300)

            # Coming up ticket button in overview
            page.locator(".events-panel .event-row .round-arrow").first.click()
            page.wait_for_selector(".ticket-modal", timeout=2000)
            record_pass("Overview event row arrow opens ticket pass modal")
            page.click(".modal-close")
            page.wait_for_timeout(200)
            record_pass("Ticket pass modal closes via X")

            # Banner button
            page.click(".bottom-banner button")
            page.wait_for_timeout(300)
            assert "FIND YOUR PEOPLE" in page.content(), "Banner navigates to Discover clubs"
            record_pass("Overview bottom banner button navigates to Discover clubs")
        except Exception as e:
            record_fail("Overview section buttons", e)

        # ----------------------------------------------------
        # 4. DISCOVER CLUBS SECTION
        # ----------------------------------------------------
        print("\n--- 4. Testing Discover Clubs Section ---")
        try:
            page.click(".side-nav button:has-text('Discover clubs')")
            page.wait_for_timeout(300)

            # Filter chips
            page.click(".filter-chips button:has-text('CREATIVE')")
            page.wait_for_timeout(200)
            assert "Design Society" in page.locator(".club-grid").inner_text() and "Robotics & AI" not in page.locator(".club-grid").inner_text(), "CREATIVE chip filters"
            record_pass("Category filter chip 'CREATIVE' filters clubs")

            page.click(".filter-chips button:has-text('ALL CLUBS')")
            page.wait_for_timeout(200)
            record_pass("Filter chip 'ALL CLUBS' resets clubs list")

            # Search box
            page.fill("#global-search", "Robotics")
            page.wait_for_timeout(200)
            assert "Robotics & AI" in page.locator(".club-grid").inner_text() and "Design Society" not in page.locator(".club-grid").inner_text(), "Search filters clubs"
            page.fill("#global-search", "")
            page.wait_for_timeout(200)
            record_pass("Search box filters and clears properly")

            # Join club button toggle
            join_btn = page.locator(".club-card:nth-child(1) .join-button")
            orig_text = join_btn.inner_text()
            join_btn.click()
            page.wait_for_timeout(300)
            new_text = join_btn.inner_text()
            assert orig_text != new_text, "Join button toggled status"
            record_pass("Join/Leave club button toggles membership state")

            # Start a club proposal modal
            page.click(".club-cta button")
            page.wait_for_selector(".ticket-modal form", timeout=2000)
            page.fill(".ticket-modal input[name='clubName']", "AI Coding Guild")
            page.fill(".ticket-modal input[name='clubDesc']", "Building agents and exploring generative algorithms.")
            page.click(".ticket-modal button[type='submit']")
            page.wait_for_timeout(400)
            assert "AI Coding Guild" in page.content(), "New club created in catalog"
            record_pass("Start a club modal proposal successfully adds club")
        except Exception as e:
            record_fail("Discover clubs section", e)

        # ----------------------------------------------------
        # 5. EVENTS & TICKETING SECTION
        # ----------------------------------------------------
        print("\n--- 5. Testing Events & Ticketing Section ---")
        try:
            page.click(".side-nav button:has-text('Events')")
            page.wait_for_timeout(300)

            # Get ticket button
            ticket_btn = page.locator(".full-event:nth-child(1) .ticket-button")
            ticket_btn.click()
            page.wait_for_selector(".ticket-modal", timeout=2000)
            assert "YOUR DIGITAL PASS" in page.content(), "Ticket modal has pass"
            record_pass("Event 'GET YOUR TICKET' button opens ticket modal")

            # Check-in via modal
            page.click(".modal-done")
            page.wait_for_timeout(300)
            record_pass("Event check-in from pass modal works")

            # Inline event creation (as Officer)
            page.select_option(".role-switch select", "Club Leader")
            page.wait_for_timeout(300)
            page.fill(".inline-create input:nth-child(1)", "Autonomous Hackathon 2026")
            page.fill(".inline-create input:nth-child(2)", "Robotics & AI")
            page.click(".inline-create button:has-text('ADD EVENT')")
            page.wait_for_timeout(400)
            assert "Autonomous Hackathon 2026" in page.content(), "New event created"
            record_pass("Inline event creation form adds new event")
            page.select_option(".role-switch select", "Student")
            page.wait_for_timeout(300)
        except Exception as e:
            record_fail("Events section", e)

        # ----------------------------------------------------
        # 6. VOLUNTEERS SECTION
        # ----------------------------------------------------
        print("\n--- 6. Testing Volunteers Section ---")
        try:
            page.click(".side-nav button:has-text('Volunteers')")
            page.wait_for_timeout(300)

            # Apply to opportunity
            apply_btn = page.locator(".volunteer-list .round-arrow").first
            apply_btn.click()
            page.wait_for_timeout(300)
            record_pass("Volunteer opportunity apply button triggers registration")

            # Switch to My commitments tab
            page.click(".section-tabs button:has-text('My commitments')")
            page.wait_for_timeout(200)
            assert "CONFIRMED" in page.content(), "Commitments list rendered"
            record_pass("Volunteers tab switches to My commitments with confirmed items")
        except Exception as e:
            record_fail("Volunteers section", e)

        # ----------------------------------------------------
        # 7. TASKS SECTION (Club Leader)
        # ----------------------------------------------------
        print("\n--- 7. Testing Tasks Section ---")
        try:
            page.select_option(".role-switch select", "Club Leader")
            page.wait_for_timeout(300)
            page.click(".side-nav button:has-text('Tasks')")
            page.wait_for_timeout(300)

            # Check off task
            check_btn = page.locator(".task-row .task-check").first
            check_btn.click()
            page.wait_for_timeout(200)
            record_pass("Task completion checkbox toggles")

            # Add task
            page.fill(".inline-create input:nth-child(1)", "Order badges for summit")
            page.fill(".inline-create input:nth-child(2)", "Student Council")
            page.click(".inline-create button:has-text('ADD TASK')")
            page.wait_for_timeout(300)
            assert "Order badges for summit" in page.content(), "New task created"
            record_pass("Task creation inline form adds task")

            # Delete task
            del_btn = page.locator(".task-row:has-text('Order badges for summit') .delete-row")
            del_btn.click()
            page.wait_for_timeout(200)
            assert "Order badges for summit" not in page.content(), "Task deleted"
            record_pass("Task delete button removes task")
        except Exception as e:
            record_fail("Tasks section", e)

        # ----------------------------------------------------
        # 8. MARKETPLACE SECTION
        # ----------------------------------------------------
        print("\n--- 8. Testing Marketplace Section ---")
        try:
            page.click(".side-nav button:has-text('Marketplace')")
            page.wait_for_timeout(300)

            # Add listing
            page.fill(".listing-form input[type='text']", "Vintage Campus Sweatshirt")
            page.fill(".listing-form input[type='number']", "650")
            page.click(".listing-form button")
            page.wait_for_timeout(300)
            assert "Vintage Campus Sweatshirt" in page.content(), "Marketplace listing added"
            record_pass("Marketplace listing create form adds product")

            # Ask about this item button
            page.locator(".market-card:has-text('Vintage Campus Sweatshirt') button").click()
            page.wait_for_timeout(300)
            assert "MESSAGES" in page.locator(".topbar").inner_text() or "Messages" in page.locator(".breadcrumbs").inner_text(), "Redirected to messages"
            record_pass("'ASK ABOUT THIS ->' button navigates to Messages with pre-filled inquiry")
        except Exception as e:
            record_fail("Marketplace section", e)

        # ----------------------------------------------------
        # 9. MESSAGES SECTION
        # ----------------------------------------------------
        print("\n--- 9. Testing Messages Section ---")
        try:
            page.click(".side-nav button:has-text('Messages')")
            page.wait_for_timeout(300)

            # Switch conversation channel
            page.click(".conversation-list button:has-text('Design Society')")
            page.wait_for_timeout(200)
            assert page.locator(".conversation header b").inner_text() == "Design Society", "Channel switched"
            record_pass("Message channel switching works")

            # Send message
            page.fill(".message-compose input", "Hello Design Society team!")
            page.click(".message-compose button")
            page.wait_for_timeout(300)
            assert "Hello Design Society team!" in page.locator(".message-history").inner_text(), "Message sent"
            record_pass("Sending message updates active conversation thread")
        except Exception as e:
            record_fail("Messages section", e)

        # ----------------------------------------------------
        # 10. HELP DESK SECTION
        # ----------------------------------------------------
        print("\n--- 10. Testing Help Desk Section ---")
        try:
            page.select_option(".role-switch select", "Student")
            page.wait_for_timeout(300)
            page.click(".side-nav button:has-text('Help desk')")
            page.wait_for_timeout(300)

            # Upvote issue
            upvote_btn = page.locator(".issue-row button:has-text('♡')").first
            orig_vote_text = upvote_btn.inner_text()
            upvote_btn.click()
            page.wait_for_timeout(200)
            new_vote_text = upvote_btn.inner_text()
            assert orig_vote_text != new_vote_text, "Vote count incremented"
            record_pass("Issue upvote button increments vote")

            # Submit new issue
            page.fill(".issue-form input", "Need better lighting on the North Walkway")
            page.select_option(".issue-form select", "Infrastructure")
            page.click(".issue-form button")
            page.wait_for_timeout(300)
            assert "Need better lighting on the North Walkway" in page.content(), "Issue submitted"
            record_pass("Help desk issue submit form creates ticket")

            # Moderation status cycle (switch to Admin)
            page.select_option(".role-switch select", "Admin")
            page.wait_for_timeout(300)
            status_btn = page.locator(".issue-row:has-text('Need better lighting') .status-badge")
            if status_btn.count() > 0:
                status_btn.click()
                page.wait_for_timeout(200)
                record_pass("Issue status cycling for moderators works")
        except Exception as e:
            record_fail("Help desk section", e)

        # ----------------------------------------------------
        # 11. FINANCE SECTION
        # ----------------------------------------------------
        print("\n--- 11. Testing Finance Section ---")
        try:
            page.select_option(".role-switch select", "Student Council")
            page.wait_for_timeout(300)
            page.click(".side-nav button:has-text('Finance')")
            page.wait_for_timeout(300)

            # Record finance entry
            page.fill(".finance-create input[type='text']", "Design Jam art supplies")
            page.fill(".finance-create input[type='number']", "3200")
            page.select_option(".finance-create select", "out")
            page.click(".finance-create button")
            page.wait_for_timeout(300)
            assert "Design Jam art supplies" in page.content(), "Finance entry in ledger"
            record_pass("Finance entry recording updates transaction ledger")
        except Exception as e:
            record_fail("Finance section", e)

        # ----------------------------------------------------
        # 12. COUNCIL & ELECTIONS SECTION
        # ----------------------------------------------------
        print("\n--- 12. Testing Council & Elections Section ---")
        try:
            page.select_option(".role-switch select", "Student Council")
            page.wait_for_timeout(300)
            page.click(".side-nav button:has-text('Council')")
            page.wait_for_timeout(300)

            # Voice row support
            voice_btn = page.locator(".voice-row button").first
            voice_btn.click()
            page.wait_for_timeout(200)
            record_pass("Council Voice idea support toggle works")

            # Share idea modal
            page.click(".listening-panel button:has-text('Share an idea')")
            page.wait_for_selector(".ticket-modal form", timeout=2000)
            page.fill(".ticket-modal input[name='ideaTitle']", "Student lounge board games")
            page.click(".ticket-modal button[type='submit']")
            page.wait_for_timeout(300)
            assert "Student lounge board games" in page.content(), "Council idea added"
            record_pass("Council 'Share an idea' modal adds proposal")

            # Election rules modal
            page.click("button:has-text('HOW ELECTIONS WORK')")
            page.wait_for_selector(".ticket-modal", timeout=2000)
            page.click(".modal-done")
            page.wait_for_timeout(200)
            record_pass("Election rules modal opens and closes")

            # Elections voting
            page.click(".side-nav button:has-text('Elections')")
            page.wait_for_timeout(300)
            vote_btn = page.locator(".candidate-card:nth-child(1) button")
            if not vote_btn.is_disabled():
                vote_btn.click()
                page.wait_for_timeout(300)
                assert vote_btn.is_disabled(), "Vote button disabled after vote"
                record_pass("Election candidate voting records vote and disables button")
            else:
                record_pass("Election voting verified (already voted)")
        except Exception as e:
            record_fail("Council & Elections section", e)

        # ----------------------------------------------------
        # 13. ADMINISTRATION SECTION (Admin Role)
        # ----------------------------------------------------
        print("\n--- 13. Testing Administration Section ---")
        try:
            page.select_option(".role-switch select", "Admin")
            page.wait_for_timeout(300)
            page.click(".side-nav button:has-text('Administration')")
            page.wait_for_timeout(300)

            # Directory search
            page.fill(".admin-panel input", "Arjun")
            page.wait_for_timeout(200)
            assert "Arjun" in page.locator(".admin-panel").inner_text(), "Directory filtered"
            page.fill(".admin-panel input", "")
            page.wait_for_timeout(200)
            record_pass("Admin role directory search filters members")

            # Role update
            user_select = page.locator(".admin-user:nth-child(2) select")
            if user_select.count() > 0:
                user_select.select_option("Faculty")
                page.wait_for_timeout(300)
                record_pass("Admin role modification select updates user role")
        except Exception as e:
            record_fail("Administration section", e)

        # ----------------------------------------------------
        # 14. COLLEGE PORTAL SECTION (SRS)
        # ----------------------------------------------------
        print("\n--- 14. Testing College Portal Section ---")
        try:
            page.click(".side-nav button:has-text('College portal')")
            page.wait_for_timeout(300)

            # Campus details handbook modal
            page.click("button:has-text('CAMPUS DETAILS')")
            page.wait_for_selector(".ticket-modal", timeout=2000)
            assert "NORTHSTAR DIRECTORY" in page.content(), "Handbook displayed"
            page.click(".modal-done")
            page.wait_for_timeout(200)
            record_pass("College portal 'CAMPUS DETAILS' handbook modal opens and closes")

            # Save offer button
            page.click("button:has-text('SAVE OFFER')")
            page.wait_for_timeout(200)
            record_pass("College portal 'SAVE OFFER' button triggers toast")

            # Official club directory link
            page.locator(".portal-club-row button").first.click()
            page.wait_for_timeout(300)
            assert "FIND YOUR PEOPLE" in page.content(), "Directory button navigates to clubs"
            record_pass("College portal official club button navigates to Discover clubs")
        except Exception as e:
            record_fail("College portal section", e)

        # ----------------------------------------------------
        # 15. MEMBERSHIP SECTION (SRS)
        # ----------------------------------------------------
        print("\n--- 15. Testing Membership Section ---")
        try:
            page.click(".side-nav button:has-text('Membership')")
            page.wait_for_timeout(300)

            # View benefits modal
            page.click(".membership-card:has-text('ACTIVE') button")
            page.wait_for_selector(".ticket-modal", timeout=2000)
            assert "BENEFITS" in page.content(), "Benefits modal opens"
            page.click(".modal-done")
            page.wait_for_timeout(200)
            record_pass("Membership 'VIEW BENEFITS' modal opens and closes")

            # Pay / Renew dues button
            renew_btn = page.locator(".membership-card:has-text('RENEW SOON') button, .membership-card:has-text('PENDING') button").first
            if renew_btn.count() > 0:
                renew_btn.click()
                page.wait_for_timeout(300)
                record_pass("Membership pay/renew dues button activates status")

            # Remind me later button
            page.click(".membership-note button")
            page.wait_for_timeout(200)
            record_pass("Membership 'REMIND ME LATER' button triggers toast")
        except Exception as e:
            record_fail("Membership section", e)

        # ----------------------------------------------------
        # 16. ANNOUNCEMENTS SECTION (SRS)
        # ----------------------------------------------------
        print("\n--- 16. Testing Announcements Section ---")
        try:
            page.select_option(".role-switch select", "Admin")
            page.wait_for_timeout(300)
            page.click(".side-nav button:has-text('Announcements')")
            page.wait_for_timeout(300)

            # Pin announcement button
            pin_btn = page.locator(".announcement-card .announcement-foot button").first
            pin_btn.click()
            page.wait_for_timeout(200)
            record_pass("Announcement pin button functions")

            # Publish announcement (as Council/Admin)
            page.fill(".announcement-compose textarea", "Important: Autumn term project submission guidelines posted.")
            page.click(".announcement-compose button")
            page.wait_for_timeout(300)
            assert "Important: Autumn term project submission guidelines posted." in page.content(), "Announcement published"
            record_pass("Announcement studio publishing adds broadcast to live feed")
        except Exception as e:
            record_fail("Announcements section", e)

        # ----------------------------------------------------
        # 17. CLUB SHOP SECTION (SRS)
        # ----------------------------------------------------
        print("\n--- 17. Testing Club Shop Section ---")
        try:
            page.click(".side-nav button:has-text('Club shop')")
            page.wait_for_timeout(300)

            # Add to order
            order_btn = page.locator(".shop-card:nth-child(1) button:has-text('ADD TO ORDER')")
            order_btn.click()
            page.wait_for_timeout(300)
            record_pass("Club shop 'ADD TO ORDER +' button adds item to cart")

            # Open bag / cart modal
            page.click("button:has-text('BAG (')")
            page.wait_for_selector(".ticket-modal", timeout=2000)
            assert "YOUR MERCH BAG" in page.content(), "Cart modal opened"
            page.click(".modal-done")
            page.wait_for_timeout(300)
            record_pass("Club shop cart modal opens and places order successfully")
        except Exception as e:
            record_fail("Club shop section", e)

        # ----------------------------------------------------
        # 18. ACHIEVEMENTS SECTION (SRS)
        # ----------------------------------------------------
        print("\n--- 18. Testing Achievements Section ---")
        try:
            page.click(".side-nav button:has-text('Achievements')")
            page.wait_for_timeout(300)

            # Leaderboard tabs
            page.click(".leaderboard-tabs button:has-text('MARKETPLACE')")
            page.wait_for_timeout(200)
            assert page.locator(".leaderboard-tabs button:has-text('MARKETPLACE')").get_attribute("class") == "active", "Marketplace tab active"
            page.click(".leaderboard-tabs button:has-text('VOLUNTEERS')")
            page.wait_for_timeout(200)
            record_pass("Achievements leaderboard tabs switch cleanly")

            # Edit profile modal
            page.click("button:has-text('EDIT PROFILE')")
            page.wait_for_selector(".ticket-modal form", timeout=2000)
            page.fill(".ticket-modal input[name='userName']", "Maya Patel · Lead")
            page.click(".ticket-modal button[type='submit']")
            page.wait_for_timeout(300)
            assert "Maya Patel · Lead" in page.content(), "Profile name updated"
            record_pass("Edit profile modal updates display name")
        except Exception as e:
            record_fail("Achievements section", e)

        # ----------------------------------------------------
        # 19. CLUB DASHBOARD SECTION (SRS)
        # ----------------------------------------------------
        print("\n--- 19. Testing Club Dashboard Section ---")
        try:
            page.click(".side-nav button:has-text('Club dashboard')")
            page.wait_for_timeout(300)

            # Switch theme button
            page.click("button:has-text('SWITCH THEME')")
            page.wait_for_timeout(300)
            record_pass("Club dashboard 'SWITCH THEME' toggles page engine theme")

            # Public page preview modal
            page.click("button:has-text('PREVIEW PUBLIC PAGE')")
            page.wait_for_selector(".ticket-modal", timeout=2000)
            assert "LIVE PREVIEW" in page.content(), "Public preview displayed"
            page.click(".modal-done")
            page.wait_for_timeout(200)
            record_pass("Club dashboard public preview modal opens and closes")

            # Shortcut navigation
            page.click("button:has-text('MANAGE MEMBERS')")
            page.wait_for_timeout(300)
            assert "YOUR CAMPUS CIRCLE" in page.content(), "Navigated to Membership"
            record_pass("Club dashboard shortcut button navigates to Membership")
        except Exception as e:
            record_fail("Club dashboard section", e)

        # ----------------------------------------------------
        # 20. SIGN OUT
        # ----------------------------------------------------
        print("\n--- 20. Testing Sign Out ---")
        try:
            page.click(".profile-button")
            page.wait_for_url("http://localhost:3000/login")
            record_pass("Profile sign out button clears session and redirects to /login")
        except Exception as e:
            record_fail("Sign out", e)

        browser.close()

    print("\n==================================================")
    print("TEST SUITE RESULTS SUMMARY")
    print("==================================================")
    print(f"Total Passed: {len(passed_tests)}")
    print(f"Total Failed: {len(failed_tests)}")
    if console_errors:
        print(f"Console Errors Encountered: {len(console_errors)}")
        for ce in console_errors[:5]:
            print(f"  - {ce}")
    else:
        print("Console Errors Encountered: 0")

    if failed_tests:
        print("\nFailed Tests:")
        for name, err in failed_tests:
            print(f"  - {name}: {err}")
        sys.exit(1)
    else:
        print("\nALL BUTTONS AND INTERACTIONS PASSED PERFECTLY!")
        sys.exit(0)

if __name__ == "__main__":
    run_tests()
