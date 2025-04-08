
setTimeout(() => {
    const table = document.getElementById('kt_ViewTable');
    if (table) {
        console.log('Table found:', table);
        const rows = table.rows;
        const classes_needed = ["Classes Required\n(for 75% attendance)"];
        const absences_affordable = ["Absences Allowance"];
        let tablearr = arraygen(table);
        for (let i = 1; i < rows.length; i++) {
            let present, absent, total, classesNeeded, absencesAffordable;
            present = tablearr[i][6];
            absent = tablearr[i][7];
            total = tablearr[i][8];

            classesNeeded = getClassesNeeded(present, total);

            absencesAffordable = getAbsencesAffordable(absent, total);
            if(classesNeeded<0){
                classesNeeded = 0;
            }
            classes_needed.push(Math.ceil(classesNeeded));
            if(absencesAffordable<0){
                absencesAffordable = 0;
            }
            absences_affordable.push(Math.floor(absencesAffordable));

        }
    
        for(let i = 0 ; i<rows.length ; i++){
            let row = rows.item(i);
            let cn = row.insertCell(-1);
            cn.innerText = classes_needed[i];
            cn.style.textAlign = "center";

            let aa = row.insertCell(-1);
            aa.innerText = absences_affordable[i];
            aa.style.textAlign = "center";

        }


    } else {
        console.log('Attendance data missing!');
    }
}, 2000);



function arraygen(table) {
    if (table) {
        const tableData = [];
        const rows = table.rows;

        for (let i = 0; i < rows.length; i++) {
            const rowData = [];
            const cells = rows[i].cells;

            for (let j = 0; j < cells.length; j++) {
                rowData.push(cells[j].textContent.trim()); // Get text content and trim whitespace
            }

            tableData.push(rowData);
        }
        return tableData;

    } else {
        console.log("Table element not found.");
    }
}

function getClassesNeeded(present, total) {
    let x;
    x = (3 * total) - (4 * present);
    return x;
}

function getAbsencesAffordable(absent, total) {
    let y;
    y = ((total - (4 * absent)) / 3);
    return y;
}

