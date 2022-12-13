try {
    document.getElementById('user_profile').addEventListener('click', e => {
        e.preventDefault();
        let element = document.getElementById('subMenuWrapper');
        element.classList.toggle('open_menu');
    });

    document.addEventListener('click', e => {
        //Keep menu open when menu is clicked
        if (e.target.matches('.sub_menu') || e.target.matches('.user_info') || e.target.matches('#user_profile') || e.target.matches('#userFullName')) {
            console.log('RETURN');
            return;
        }

        //Close menu when anywhere else on page is clicked
        let element = document.getElementById('subMenuWrapper');
        if (element.classList.contains('open_menu'))
            element.classList.toggle('open_menu');
    });
} catch (err) {
}
