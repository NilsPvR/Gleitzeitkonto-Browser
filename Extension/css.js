module.exports =
    `@keyframes refreshRotate {
        from {transform: rotate(0deg);}
        to {transform: rotate(360deg);}
    }

    #refresh-icon {
        width: 25px;
        height: 25px;
        animation-name: refreshRotate;
        animation-duration: 1s;
        animation-fill-mode: forwards;
        animation-iteration-count: infinite;
        animation-timing-function: cubic-bezier(0.2, 0.6, 0.8, 0.4);
    }`;