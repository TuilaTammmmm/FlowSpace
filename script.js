function openTab(tabName) {
    var i, tabcontent;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).classList.add("active");
}
// --- PHẦN KÉO THẢ (DRAG & DROP) ---

function allowDrop(ev) {
    ev.preventDefault(); // Mặc định trình duyệt không cho thả, phải chặn nó lại
}

function drag(ev) {
    // Lưu ID của cái thẻ đang được kéo
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var draggedElement = document.getElementById(data);

    // Kiểm tra xem nơi thả có phải là cột (column) hoặc danh sách (task-list) không
    // Để tránh trường hợp thả lồng vào trong một task khác
    if (ev.target.classList.contains("column") || ev.target.classList.contains("task-list")) {
        // Tìm cái danh sách task bên trong cột đó để append vào
        var targetList = ev.target.closest(".column").querySelector(".task-list");
        targetList.appendChild(draggedElement);
    } 
    // Nếu thả trúng header hoặc task khác, tìm về cha là .column
    else {
        var closestColumn = ev.target.closest(".column");
        if(closestColumn) {
             closestColumn.querySelector(".task-list").appendChild(draggedElement);
        }
    }
}

// --- PHẦN THÊM TASK MỚI ---

function addTask(listId) {
    // 1. Hỏi người dùng tên task
    let taskContent = prompt("Nhập nội dung công việc:");
    
    if (taskContent) {
        // 2. Tạo ID ngẫu nhiên cho task (để kéo thả được)
        let taskId = "task-" + new Date().getTime();

        // 3. Tạo HTML cho task mới
        let newTask = document.createElement("div");
        newTask.className = "task";
        newTask.id = taskId;
        newTask.draggable = true;
        newTask.setAttribute("ondragstart", "drag(event)");
        
        newTask.innerHTML = `
            ${taskContent}
            <span class="delete-btn" onclick="deleteTask(this)">×</span>
        `;

        // 4. Thêm vào cột tương ứng
        document.getElementById(listId).appendChild(newTask);
    }
}

// --- PHẦN XÓA TASK ---
function deleteTask(element) {
    if(confirm("Bạn có chắc muốn xóa không?")) {
        element.parentElement.remove();
    }
}