setTimeout(async () => {
    const table = document.getElementById('kt_ViewTable');
    if (!table) {
        console.log('Attendance data missing!');
        return;
    }
    
    contentObj = document.getElementsByClassName('col-lg-12')
    contentObj[1].children[0].textContent = "Detain Shield: To set a custom attendance target for a course, hover over the course name and click the ✎ icon. To change an existing target, click the current target percentage. The default target attendance is 75%"

    const rows = table.rows;
    const tablearr = arraygen(table);

    const { targets = {} } = await chrome.storage.local.get("targets");

    injectStyles();

    
    const headerRow = rows[0];
    insertHeaderCell(headerRow, headerRow.cells.length, "Must Attend");
    insertHeaderCell(headerRow, headerRow.cells.length, "Safe Skips");

    
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const courseNameCell = row.cells[1];
        const courseName = tablearr[i][1];
        const present = Number(tablearr[i][6]) || 0;
        const total = Number(tablearr[i][8]) || 0;

        const courseCode = extractCourseCode(courseName);
        let target = targets[courseCode] ?? 75;
        let isCustom = courseCode in targets;

        courseNameCell.classList.add("ds-name-cell");

        const badge = document.createElement("span");
        badge.className = "ds-badge";
        courseNameCell.appendChild(badge);

        
        const classesCell = row.insertCell(-1);
        classesCell.style.textAlign = "center";
        const absencesCell = row.insertCell(-1);
        absencesCell.style.textAlign = "center";

        const paintBadge = () => {
            let is_bad_target = false
            if(target < 75){
                is_bad_target = true
            }

            if (isCustom && is_bad_target) {
                badge.textContent = `Target: ${target}%`;
                badge.className = "ds-badge ds-badtarget";
                badge.title = "Click to change or reset target attendance";
            } else if (isCustom && !is_bad_target){
                badge.textContent = `Target: ${target}%`;
                badge.className = "ds-badge ds-custom";
                badge.title = "Click to change or reset target attendance";

            } else {
                badge.textContent = "\u270E"; 
                badge.className = "ds-badge ds-default";
                badge.title = "Set a target attendance for this course";
            }
        };

        const renderComputed = () => {
            const classesNeeded = Math.max(0, Math.ceil(getClassesNeeded(present, total, target)));
            const absencesAffordable = Math.max(0, Math.floor(getAbsencesAffordable(present, total, target)));
            classesCell.innerText = total === 0 ? 0 : classesNeeded;
            absencesCell.innerText = total === 0 ? 0 : absencesAffordable;
        };

        paintBadge();
        renderComputed();

        const startEdit = () => {
            const input = document.createElement("input");
            input.type = "number";
            input.min = "1";
            input.max = "99";
            input.value = target;
            input.className = "ds-input";

            courseNameCell.replaceChild(input, badge);
            input.focus();
            input.select();

            const finishEdit = async () => {
                let val = parseInt(input.value, 10);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 99) val = 99;

                const { targets: current = {} } = await chrome.storage.local.get("targets");
                isCustom = val !== 75;
                if (isCustom) {
                    current[courseCode] = val;
                } else {
                    delete current[courseCode];
                }
                await chrome.storage.local.set({ targets: current });

                target = val;
                paintBadge();
                renderComputed();
                courseNameCell.replaceChild(badge, input);
            };

            input.addEventListener("blur", finishEdit);
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") input.blur();
                if (e.key === "Escape") {
                    input.value = target;
                    input.blur();
                }
            });
        };

        badge.addEventListener("click", startEdit);
    }
}, 2000);

function injectStyles() {
    if (document.getElementById("ds-styles")) return;
    const style = document.createElement("style");
    style.id = "ds-styles";
    style.textContent = `
        .ds-name-cell { position: relative; }
        .ds-badge {
            display: inline-block;
            margin-left: 8px;
            font-size: 0.8em;
            cursor: pointer;
            vertical-align: middle;
        }
        .ds-badge.ds-default {
            color: #999;
            opacity: 0;
            transition: opacity 0.15s ease;
        }
        .ds-name-cell:hover .ds-badge.ds-default {
            opacity: 1;
        }
        .ds-badge.ds-custom {
            color: #2563eb;
            font-weight: 600;
            opacity: 1;
        }
        
        .ds-badge.ds-badtarget {
            color: #FF0000;
            font-weight: 600;
            opacity: 1
        
        }

        .ds-input {
            width: 40px;
            margin-left: 8px;
            text-align: center;
            font-size: 0.8em;
            border: none;
            border-bottom: 1px solid #2563eb;
            outline: none;
            background: transparent;
        }
    `;
    document.head.appendChild(style);
}

function insertHeaderCell(row, index, text) {
    const cell = row.insertCell(index);
    cell.innerText = text;
    cell.style.textAlign = "center";
}

function extractCourseCode(courseName) {
    const index = courseName.indexOf(":");
    return index === -1 ? courseName.trim() : courseName.slice(0, index).trim();
}

function arraygen(table) {
    if (!table) {
        console.log("Table element not found.");
        return [];
    }
    const tableData = [];
    const rows = table.rows;

    for (let i = 0; i < rows.length; i++) {
        const rowData = [];
        const cells = rows[i].cells;

        for (let j = 0; j < cells.length; j++) {
            rowData.push(cells[j].textContent.trim());
        }

        tableData.push(rowData);
    }
    return tableData;
}


function getClassesNeeded(present, total, targetPercent) {
    const f = targetPercent / 100;
    return (f * total - present) / (1 - f);
}


function getAbsencesAffordable(present, total, targetPercent) {
    const f = targetPercent / 100;
    return (present / f) - total;
}