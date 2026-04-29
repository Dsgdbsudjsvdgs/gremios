// Updated Masking Logical to handle Date and CPF
const InputMask = {
    cpf: (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
            .substring(0, 14);
    },
    date: (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1/$2')
            .replace(/(\d{2})(\d)/, '$1/$2')
            .substring(0, 10);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            e.target.value = InputMask.cpf(e.target.value);
        });
    }

    const dateInput = document.getElementById('data-nasc');
    if (dateInput) {
        dateInput.addEventListener('input', (e) => {
            e.target.value = InputMask.date(e.target.value);
        });
    }
});
