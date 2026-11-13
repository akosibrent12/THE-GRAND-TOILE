
/* =========================================================
   THE GRAND ÉTOILE
   LUXURY RESORT & SPA
   Complete Shared JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       01. MOBILE NAVIGATION
       ===================================================== */

    const menuToggle = document.getElementById("menuToggle");
    const mainNavigation = document.getElementById("main-navigation");

    if (menuToggle && mainNavigation) {

        const closeMenu = () => {
            mainNavigation.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
        };

        const openMenu = () => {
            mainNavigation.classList.add("active");
            menuToggle.setAttribute("aria-expanded", "true");
            menuToggle.setAttribute("aria-label", "Close navigation menu");
        };

        menuToggle.addEventListener("click", () => {
            const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu after selecting a navigation link
        mainNavigation.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", closeMenu);
        });

        // Close menu when clicking outside
        document.addEventListener("click", event => {
            if (
                !menuToggle.contains(event.target) &&
                !mainNavigation.contains(event.target)
            ) {
                closeMenu();
            }
        });

        // Close menu using Escape
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        // Close mobile menu when returning to desktop layout
        window.addEventListener("resize", () => {
            if (window.innerWidth > 850) {
                closeMenu();
            }
        });
    }


    /* =====================================================
       02. AUTOMATIC COPYRIGHT YEAR
       ===================================================== */

    const yearElements = document.querySelectorAll(".current-year");

    yearElements.forEach(element => {
        element.textContent = new Date().getFullYear();
    });


    /* =====================================================
       03. DATE UTILITIES
       ===================================================== */

    const formatLocalDate = date => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const addDays = (dateString, numberOfDays) => {
        const date = new Date(`${dateString}T12:00:00`);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        date.setDate(date.getDate() + numberOfDays);

        return formatLocalDate(date);
    };


    /* =====================================================
       04. BOOKING FORM DATE VALIDATION
       ===================================================== */

    const checkInInputs = document.querySelectorAll(
        '#checkin, [name="checkin"]'
    );

    const checkOutInputs = document.querySelectorAll(
        '#checkout, [name="checkout"]'
    );

    const today = formatLocalDate(new Date());

    checkInInputs.forEach(checkIn => {

        if (checkIn.type === "date") {
            checkIn.min = today;
        }

        const relatedCheckOut = Array.from(checkOutInputs).find(
            checkOut => checkOut.form === checkIn.form
        );

        const updateCheckOut = () => {

            if (!relatedCheckOut || !checkIn.value) {
                return;
            }

            const minimumCheckOut = addDays(checkIn.value, 1);

            relatedCheckOut.min = minimumCheckOut;

            if (
                relatedCheckOut.value &&
                relatedCheckOut.value <= checkIn.value
            ) {
                relatedCheckOut.value = "";
            }
        };

        checkIn.addEventListener("change", updateCheckOut);

        updateCheckOut();
    });


    checkOutInputs.forEach(checkOut => {

        const relatedCheckIn = Array.from(checkInInputs).find(
            checkIn => checkIn.form === checkOut.form
        );

        if (!relatedCheckIn) {
            return;
        }

        checkOut.addEventListener("change", () => {

            if (
                relatedCheckIn.value &&
                checkOut.value &&
                checkOut.value <= relatedCheckIn.value
            ) {
                checkOut.setCustomValidity(
                    "Check-out must be at least one day after check-in."
                );
            } else {
                checkOut.setCustomValidity("");
            }

        });

        relatedCheckIn.addEventListener("change", () => {
            checkOut.setCustomValidity("");
        });

    });


    /* =====================================================
       05. BOOKING FORM VALIDATION
       ===================================================== */

    const bookingForm = document.getElementById("bookingForm");

    if (bookingForm) {

        bookingForm.addEventListener("submit", event => {

            const checkIn = bookingForm.querySelector(
                '#checkin, [name="checkin"]'
            );

            const checkOut = bookingForm.querySelector(
                '#checkout, [name="checkout"]'
            );

            if (
                checkIn &&
                checkOut &&
                checkIn.value &&
                checkOut.value &&
                checkOut.value <= checkIn.value
            ) {

                event.preventDefault();

                checkOut.setCustomValidity(
                    "Please select a check-out date after your check-in date."
                );

                checkOut.reportValidity();
                checkOut.focus();

                return;
            }

            if (checkOut) {
                checkOut.setCustomValidity("");
            }

        });

    }


    /* =====================================================
       06. RESERVATION DETAILS FROM URL
       ===================================================== */

    const urlParameters = new URLSearchParams(window.location.search);

    const fieldMappings = {
        room: [
            "room",
            "roomType",
            "accommodation"
        ],

        checkin: [
            "checkin",
            "checkIn",
            "arrival"
        ],

        checkout: [
            "checkout",
            "checkOut",
            "departure"
        ],

        guests: [
            "guests",
            "guest",
            "adults"
        ],

        roomType: [
            "roomType",
            "room",
            "accommodation"
        ]
    };

    const findFormField = names => {

        for (const name of names) {

            const field = document.querySelector(
                `[name="${name}"], #${CSS.escape(name)}`
            );

            if (field) {
                return field;
            }
        }

        return null;
    };


    Object.entries(fieldMappings).forEach(([parameter, fieldNames]) => {

        const value = urlParameters.get(parameter);

        if (!value) {
            return;
        }

        const field = findFormField(fieldNames);

        if (!field) {
            return;
        }

        // Only fill empty fields so existing user input is preserved
        if (field.value.trim() !== "") {
            return;
        }

        // Select matching options in dropdowns
        if (field.tagName === "SELECT") {

            const matchingOption = Array.from(field.options).find(option => {
                return (
                    option.value.toLowerCase() === value.toLowerCase() ||
                    option.textContent.trim().toLowerCase() === value.toLowerCase()
                );
            });

            if (matchingOption) {
                field.value = matchingOption.value;
            }

        } else {

            field.value = value;

        }

        field.dispatchEvent(new Event("change", {
            bubbles: true
        }));

    });


    /* =====================================================
       07. GALLERY FILTERS
       ===================================================== */

    const galleryFilterButtons = document.querySelectorAll(
        "[data-filter]"
    );

    const galleryItems = document.querySelectorAll(
        "[data-category]"
    );

    if (galleryFilterButtons.length && galleryItems.length) {

        galleryFilterButtons.forEach(button => {

            button.addEventListener("click", () => {

                const selectedFilter = button.dataset.filter;

                galleryFilterButtons.forEach(filterButton => {
                    filterButton.classList.remove("active");
                    filterButton.setAttribute("aria-pressed", "false");
                });

                button.classList.add("active");
                button.setAttribute("aria-pressed", "true");

                galleryItems.forEach(item => {

                    const category = item.dataset.category;

                    const shouldShow =
                        selectedFilter === "all" ||
                        category === selectedFilter;

                    item.hidden = !shouldShow;

                });

            });

        });

    }


    /* =====================================================
       08. SMOOTH SCROLL FOR INTERNAL LINKS
       ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetID = link.getAttribute("href");

            if (!targetID || targetID === "#") {
                return;
            }

            const target = document.querySelector(targetID);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       09. CONTACT FORM BASIC VALIDATION
       ===================================================== */

    const contactForms = document.querySelectorAll(
        ".contact-form"
    );

    contactForms.forEach(form => {

        form.addEventListener("submit", event => {

            if (!form.checkValidity()) {
                event.preventDefault();
                form.reportValidity();
            }

            /*
              This only validates the form.
              Actual email delivery requires a backend
              or an email service integration.
            */

        });

    });


    /* =====================================================
       10. IMAGE LOADING OPTIMIZATION
       ===================================================== */

    document.querySelectorAll("img").forEach(image => {

        if (!image.hasAttribute("loading")) {
            image.loading = "lazy";
        }

        image.decoding = "async";

    });


    /* =====================================================
       11. CLOSE MENU WHEN NAVIGATION IS CHANGED
       ===================================================== */

    window.addEventListener("pageshow", () => {

        if (menuToggle && mainNavigation) {
            mainNavigation.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
        }

    });


    /* =====================================================
       12. INITIALIZATION COMPLETE
       ===================================================== */

    console.log(
        "The Grand Étoile Luxury Resort & Spa website initialized successfully."
    );

});
