document.addEventListener("DOMContentLoaded", function () {
    // Get references to the columns and the add button
    const backlogColumn = document.getElementById("backlog");
    const inProgressColumn = document.getElementById("inProgress");
    const completedColumn = document.getElementById("completed");
    const addButton = document.getElementById("addButton");

    // Load saved data from localStorage or set initial data
    let backlogData = JSON.parse(localStorage.getItem("backlogData")) || [];
    let inProgressData = JSON.parse(localStorage.getItem("inProgressData")) || [];
    let completedData = JSON.parse(localStorage.getItem("completedData")) || [];

    // Function to render the items in each column
    function renderColumn(column, columnData) {
        column.innerHTML = ""; // Clear the column

        columnData.forEach(function (item) {
            const card = document.createElement("div");
            card.className = "card mb-3";
            card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                <p class="card-text">${item.description}</p>
                <p class="card-status">${item.status}</p>
            </div>
        `;

            column.appendChild(card);
        });
    }

    // Render initial data
    renderColumn(backlogColumn, backlogData);
    renderColumn(inProgressColumn, inProgressData);
    renderColumn(completedColumn, completedData);

    // Function to update localStorage and re-render the columns
    function updateColumns() {
        localStorage.setItem("backlogData", JSON.stringify(backlogData));
        localStorage.setItem("inProgressData", JSON.stringify(inProgressData));
        localStorage.setItem("completedData", JSON.stringify(completedData));

        renderColumn(backlogColumn, backlogData);
        renderColumn(inProgressColumn, inProgressData);
        renderColumn(completedColumn, completedData);
    }

    // Enable draggable functionality for each column
    new Sortable(backlogColumn, {
        group: "column",
        draggable: ".card",
        onEnd: function (evt) {
            const item = backlogData.splice(evt.oldIndex, 1)[0];
            if (evt.to === inProgressColumn) {
                inProgressData.splice(evt.newIndex, 0, item);
                item.status = "resolved";
            } else if (evt.to === completedColumn) {
                completedData.splice(evt.newIndex, 0, item);
                item.status = "overdue";
            }
            updateColumns();
        }
    });

    new Sortable(inProgressColumn, {
        group: "column",
        draggable: ".card",
        onEnd: function (evt) {
            const item = inProgressData.splice(evt.oldIndex, 1)[0];
            if (evt.to === backlogColumn) {
                backlogData.splice(evt.newIndex, 0, item);
                item.status = "open";
            } else if (evt.to === completedColumn) {
                completedData.splice(evt.newIndex, 0, item);
                item.status = "overdue";
            }
            updateColumns();
        }
    });

    new Sortable(completedColumn, {
        group: "column",
        draggable: ".card",
        onEnd: function (evt) {
            const item = completedData.splice(evt.oldIndex, 1)[0];
            if (evt.to === inProgressColumn) {
                inProgressData.splice(evt.newIndex, 0, item);
                item.status = "resolved";
            } else if (evt.to === backlogColumn) {
                backlogData.splice(evt.newIndex, 0, item);
                item.status = "open";
            }
            updateColumns();
        }
    });

    // Function to handle adding a new bug item
    function addBugItem() {
        const modal = document.getElementById("bugModal");
        modal.style.display = "block";

        const closeButton = document.getElementById("closeButton");
        closeButton.addEventListener("click", function () {
            closeModal();
        });

        const form = document.getElementById("bugForm");

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const titleInput = document.getElementById("titleInput");
            const descriptionInput = document.getElementById("descriptionInput");
            const statusSelect = document.getElementById("statusSelect");

            const title = titleInput.value.trim();
            const description = descriptionInput.value.trim();
            const status = statusSelect.value;

            if (title) {
                const newItem = { title: title, description: description, status: status };
                if (status === "open") {
                    backlogData.push(newItem);
                } else if (status === "resolved") {
                    inProgressData.push(newItem);
                } else if (status === "overdue") {
                    completedData.push(newItem);
                }
                updateColumns();
                closeModal();
            }
        });

        function closeModal() {
            modal.style.display = "none";
        }
    }

    // Add event listener to the add button
    addButton.addEventListener("click", addBugItem);
});
