/**
 * Tambahkan properti baru di bagian atas objek adminEmployees untuk melacak mode edit
 */
const adminEmployees = {
    employees: [],
    currentPage: 1,
    perPage: 10,
    filters: {
        search: '',
        department: '',
        status: ''
    },
    // PROPERTI BARU
    isEditMode: false,
    editingEmployeeId: null,

    // ... (Fungsi init, loadEmployees tetap sama) ...

    bindEvents() {
        // ... (Event listeners yang sudah ada tetap dipertahankan) ...

        // Modifikasi Form Submit pada bindEvents() Anda agar dinamis:
        const form = document.getElementById('form-add-employee');
        if (form) {
            form.addEventListener('submit', (e) => {
                if (this.isEditMode) {
                    this.handleEditEmployee(e);
                } else {
                    this.handleAddEmployee(e);
                }
            });
        }

        // Pastikan tombol close modal juga mereset status edit mode
        const closeBtn = document.getElementById('btn-close-modal');
        const cancelBtn = document.getElementById('btn-cancel-add');
        if (closeBtn) closeBtn.addEventListener('click', () => this.hideAddModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hideAddModal());
    },

    // ... (Fungsi getFilteredEmployees, renderTable, renderMobileCards, dll tetap sama) ...

    /**
     * Modifikasi fungsi hideAddModal agar mengembalikan teks modal ke mode "Tambah"
     */
    hideAddModal() {
        const modal = document.getElementById('modal-add-employee');
        const form = document.getElementById('form-add-employee');
        const modalTitle = document.getElementById('modal-title'); // Pastikan id ini ada di HTML Anda
        const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        if (form) {
            form.reset();
            const joinDateInput = document.getElementById('emp-join-date');
            if (joinDateInput) joinDateInput.valueAsDate = new Date();
        }

        // Reset state edit ke default
        this.isEditMode = false;
        this.editingEmployeeId = null;
        if (modalTitle) modalTitle.textContent = 'Tambah Karyawan Baru';
        if (submitBtn) submitBtn.textContent = 'Simpan Karyawan';
    },

    /**
     * AKTIFKAN FITUR EDIT KARYAWAN
     * Fungsi ini dipanggil saat tombol edit diklik di tabel / card mobile
     */
    editEmployee(id) {
        const emp = this.employees.find(e => e.id === id);
        if (!emp) {
            toast.error('Data karyawan tidak ditemukan');
            return;
        }

        // Set state ke mode edit
        this.isEditMode = true;
        this.editingEmployeeId = id;

        // Ubah Teks UI Modal secara dinamis agar user tahu mereka sedang mengedit
        const modalTitle = document.getElementById('modal-title');
        const form = document.getElementById('form-add-employee');
        const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
        
        if (modalTitle) modalTitle.textContent = 'Edit Data Karyawan';
        if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';

        // Isi kolom form dengan data karyawan lama
        document.getElementById('emp-name').value = emp.name || '';
        document.getElementById('emp-email').value = emp.email || '';
        document.getElementById('emp-department').value = emp.department || '';
        document.getElementById('emp-position').value = emp.position || '';
        document.getElementById('emp-shift').value = emp.shift || '';
        document.getElementById('emp-status').value = emp.status || 'active';
        
        const joinDateInput = document.getElementById('emp-join-date');
        if (joinDateInput && emp.joinDate) {
            // Memastikan format tanggal sesuai (YYYY-MM-DD) agar bisa dibaca input type="date"
            joinDateInput.value = emp.joinDate; 
        }

        // Tampilkan modal (menggunakan fungsi bawaan yang sudah Anda buat)
        this.showAddModal();
    },

    /**
     * FUNGSI BARU: HANDLE EDIT EMPLOYEE SUBMIT
     * Mengirimkan data yang diperbarui ke API dan memperbarui UI lokal
     */
    async handleEditEmployee(e) {
        e.preventDefault();

        const id = this.editingEmployeeId;
        const name = document.getElementById('emp-name').value;
        const email = document.getElementById('emp-email').value;
        const department = document.getElementById('emp-department').value;
        const position = document.getElementById('emp-position').value;
        const shift = document.getElementById('emp-shift').value;
        const status = document.getElementById('emp-status').value;
        const joinDate = document.getElementById('emp-join-date').value;

        // Cari data lama untuk mempertahankan avatar lama atau properti lain yang tidak diinput
        const oldEmpData = this.employees.find(e => e.id === id);

        const updatedData = {
            id,
            name,
            email,
            department,
            position,
            shift,
            status,
            joinDate,
            avatar: oldEmpData ? oldEmpData.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${this.getRandomColor()}&color=fff`
        };

        try {
            // Asumsi: api.updateEmployee(id, data) sudah tersedia di file api.js Anda
            const result = await api.updateEmployee(id, updatedData); 
            
            if (result.success) {
                // Update data di array lokal `this.employees`
                const index = this.employees.findIndex(e => e.id === id);
                if (index !== -1) {
                    this.employees[index] = result.data || updatedData;
                }

                // Perbarui dropdown filter jika ada departemen baru dimasukkan
                this.updateDeptFilterOptions(department);

                // Tutup modal dan refresh tampilan
                this.hideAddModal();
                this.renderTable();
                this.renderMobileCards();
                this.updatePaginationInfo();

                toast.success(`Data ${name} berhasil diperbarui!`);
            } else {
                toast.error(result.error || 'Gagal memperbarui data karyawan');
            }
        } catch (error) {
            console.error('Error updating employee:', error);
            toast.error('Terjadi kesalahan saat menyimpan data');
        }
    },

    // ... (Sisa fungsi lainnya seperti handleAddEmployee, deleteEmployee, dll) ...
};
