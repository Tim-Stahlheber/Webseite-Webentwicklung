let acc = document.getElementsByClassName("accordion");
for (let i = 0; i < acc.length; i++)
{
    acc[i].addEventListener("click", function()
    {
        this.classList.toggle("active");
        
        let panel = this.nextElementSibling;
        panel.classList.toggle("open")
    });
}

/*document.addEventListener("DOMContentLoaded", function() {
    let acc = document.getElementsByClassName("accordion");
    for (let i = 0; i < acc.length; i++)
    {
        acc[i].addEventListener("click", function()
        {
            this.classList.toggle("active");

            let panel = this.nextElementSibling;
            if (!panel) return;
            panel.classList.toggle("open");
        });
    }
});*/