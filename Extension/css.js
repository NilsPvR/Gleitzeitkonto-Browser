module.exports =
    `@keyframes refreshRotate {
        from {transform: rotate(0deg);}
        to {transform: rotate(360deg);}
    }

    #refresh-icon {
        width: 20px;
        height: 20px;
        animation-name: refreshRotate;
        animation-duration: 1s;
        animation-fill-mode: forwards;
        animation-iteration-count: infinite;
        animation-timing-function: cubic-bezier(0.2, 0.6, 0.8, 0.4);
    }

    .reset-button {
        background-color: transparent;
        border-width: 0;
        font-family: inherit;
        font-size: inherit;
        font-style: inherit;
        font-weight: inherit;
        padding: 0;
    }

    .reload-button {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 25px;
        height: 25px;
        margin-right: 10px;
        transition: 0.2s;
        border-radius: 50%;
        box-shadow: 0px 0px 3px 0px #003869;
    }
    
    .reset-button:hover {
        background-color: #9ccaf1;
        box-shadow: 0px 0px 8px 0px #003869;
    }
    
    .gleitzeit-display-line {
        margin-top: 0px;
    }
    
    .inserted-display {
        display:flex;
        line-height: 2.25rem;
        color: #003869; 
    }
    
    .floating-display {
        display: flex;
        margin-top: 11px;
        color: #003869;
    }
    
    .floating-display.internal {
        position: absolute;
        right: 11rem;
        z-index: 1;
    }
    
    .floating-display.external {
        justify-content: end;
        margin-right: 9rem;
    }`;