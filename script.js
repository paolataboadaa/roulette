import { data } from './data.js'

// RULETA TEST
const color = d3.scale.ordinal().range(["#000000", "#006BBB", "#E20715"]);
const oldrotation = 0;
// 1. Agrega el elemento SVG
const paddingRuleta = { top: 0, right: 20, bottom: 0, left: 20 };
const heightScreen = document.querySelector("#ruleta").clientHeight - 25;
const widthScreen = document.querySelector("#ruleta").clientWidth - 25;
const whScreen = Math.min(widthScreen, heightScreen);
const wRuleta = whScreen - paddingRuleta.left - paddingRuleta.right;
const hRuleta = whScreen - paddingRuleta.top - paddingRuleta.bottom;
const rRuleta = Math.min(wRuleta, hRuleta) / 2;
const svgRuleta = d3.select('#ruleta').append("svg").data([data])
    .attr("width", whScreen).attr("height", whScreen)
    .style({ "display": "block", "margin-left": "auto" })

// 2. Agrega el contenido (piezas) de la ruleta
const contentRuleta = svgRuleta.append("g").attr('id', 'content')
    .attr("transform", "translate(" + (wRuleta / 2) + "," + (hRuleta / 2) + ")")
const visRuleta = contentRuleta.append("g").attr('id', 'vis');

// 3. Agrega el gráfico de torta
const pieRuleta = d3.layout.pie().sort(null).value((d) => 1);
// 3.1. Genera el contenido de la ruleta
const arcRuleta = d3.svg.arc().outerRadius(rRuleta);
const arcsRuleta = visRuleta.selectAll("g.piece").data(pieRuleta).enter().append("g").attr("class", "piece");
arcsRuleta.append("path").attr("fill", (d, i) => color(i)).attr("d", (d) => arcRuleta(d))

// 4. Borde blanco de la ruleta
const borderWidth = whScreen * 0.025;
const outerRadiusRuleta = Math.min(wRuleta, hRuleta) / 2 - borderWidth;
const arcBorderRuleta = d3.svg.arc().innerRadius(outerRadiusRuleta).outerRadius(outerRadiusRuleta + borderWidth);
arcsRuleta.append("path").attr("fill", "#FFBE0B").attr("d", arcBorderRuleta);

// 5. Agrega el texto de los departamentos
arcsRuleta.append("text").attr("transform", (d) => {
    d.innerRadius = 0;
    d.outerRadius = rRuleta;
    d.angle = (d.startAngle + d.endAngle) / 2;
    return "rotate(" + ((d.angle * 180 / Math.PI - 90) + 2) + ")translate(" + (d.outerRadius - (borderWidth + 20)) + ")";
})
    .attr("text-anchor", "end")
    .text((d, i) => data[i].local)
    .style({ "fill": "white", "font-size": "calc(1rem + 0.4vw)", "font-weight": "bold" });

// 6. Flecha indicador Ganador
svgRuleta.append("g")
    .attr("transform", "translate(" + (wRuleta + paddingRuleta.left + paddingRuleta.right) + "," + ((hRuleta / 2) + paddingRuleta.top) + ")")
    .append("path")
    .attr("d", "M-" + (rRuleta * .15) + ",0L0," + (rRuleta * .05) + "L0,-" + (rRuleta * .05) + "Z")
    .style({ "fill": "#515AA4" });

// 7. Botón Spin Jugar
contentRuleta.append("circle").attr("cx", 0).attr("cy", 0).attr("r", whScreen * 0.09)
    .style({
        "fill": "white",
        "cursor": "pointer",
        "stroke": "white",
        "stroke-opacity": "0.30",
        "stroke-width": "10",
    });

// 8. Texto Spin Jugar
contentRuleta.append("text").attr("id", "text").attr("x", 0).attr("y", 10).attr("text-anchor", "middle")
    .text("Jugar").style({ "font-weight": "bold", "font-size": "calc(1rem + 0.65vw)", "cursor": "pointer" }); //widthScreen*0.04 + "px"

// 9. Función Spin para girar la ruleta
let elPicked = 100000;
let rotationRuleta = 0
const spinRuleta = (d) => {
    d3.select("#ruleta").style({ "transform": "scale(1)" })
    d3.select("#image").remove(); // Elimina la imagen del botón Spin
    d3.select("#text").style({ "fill": "black" }); // Muestra el texto del botón Spin

    const ps = 360 / data.length;
    const range = Math.floor((Math.random() * 1440) + 360);
    rotationRuleta = (Math.round(range / ps) * ps);
    elPicked = Math.round(data.length - (rotationRuleta % 360) / ps);
    elPicked = elPicked >= data.length ? (elPicked % data.length) : elPicked;
    rotationRuleta += 90 - Math.round(ps / 2);
    visRuleta.transition().duration(4000).attrTween("transform", rotationTween).each("end", () => {
        // 9.1. Marcar resultado final
        // const pickedTacna = 22
        d3.select(".piece:nth-child(" + (elPicked + 1) + ") path")
            // d3.select(".piece:nth-child(" + pickedTacna + ") path")
            .attr("fill", "#FFBE0B")
            .attr("stroke", "#FFBE0B")
            .attr("stroke-width", "5");
        d3.select(".piece:nth-child(" + (elPicked + 1) + ") text")
            .style({ "fill": "black", "font-size": "calc(1rem + 0.7vw)" });
        // d3.select(".piece:nth-child(" + pickedTacna + ")").style({ "transform": "scale(1.04)" })
        d3.select(".piece:nth-child(" + (elPicked + 1) + ")").style({ "transform": "scale(1.04)" })
        // 9.2. Imprime en pantalla el resultado
        d3.select("#ruleta_result h1").text("¡Felicidades ud. ha ganado!");
        // d3.select("#ruleta_result h2").text("Local: Tacna\nGanador: Paola Taboada");
        d3.select("#ruleta_result h2").text("Local: " + data[elPicked].local);
        console.log(data[elPicked].resultado == "Participante" ? "Participante" : "Ganador");

        // 9.3. Cambia el contenido del botón Spin x una imagen
        contentRuleta.append("svg:image")
            .attr("id", "image")
            .attr("xlink:href", "gift.svg")
            .attr("width", whScreen * 0.09)
            .attr("height", whScreen * 0.09)
            .attr("x", whScreen * -0.09 / 2)
            .attr("y", whScreen * -0.09 / 2)
            .style({ "cursor": "pointer" });
        d3.select("#text").style({ "fill": "white" }); // Oculta el texto del botón Spin

        // Efecto Fireworks
        playFireworks()
        // Animación Party Confetti
        showConfetti()
        // Animación Globos Random
        createBalloons(30)

        d3.select("#ruleta").style({ "transform": "scale(0.95)" })
        // contentRuleta.on("click", spinRuleta);
    });
}
const rotationTween = () => {
    const rotationTacna = 1207
    console.log(rotationTacna % 360, oldrotation, rotationRuleta);
    // const i = d3.interpolate(0, rotationTacna);
    const i = d3.interpolate(rotationTacna % 360, rotationRuleta);
    return (t) => "rotate(" + i(t) + ")";
}
contentRuleta.on("click", spinRuleta);

// Animación de Globos
const balloonContainer = document.getElementById("balloon_container");
const random = (num) => Math.floor(Math.random() * num)

const getRandomStyles = () => {
    const r = random(255);
    const g = random(255);
    const b = random(255);
    const mt = random(200);
    const ml = random(50);
    const dur = random(5) + 5;
    return `
                background-color: rgba(${r},${g},${b}, 1);
                color: rgba(${r},${g},${b},0.7); 
                box-shadow: inset -7px -3px 10px rgba(${r - 10},${g - 10},${b - 10},0.7);
                margin: ${mt}px 0 0 ${ml}px;
                animation: float ${dur}s ease-in infinite
            `;
}

const createBalloons = (num) => {
    console.log(balloonContainer);
    !balloonContainer && document.createElement("div").id('balloonContainer')
    for (let i = num; i > 0; i--) {
        const balloon = document.createElement("div");
        balloon.className = "balloon";
        balloon.style.cssText = getRandomStyles();
        balloonContainer.append(balloon);
        balloonContainer.style.opacity = 1;
    }
}

const removeBalloons = () => {
    balloonContainer.style.opacity = 0;
    setTimeout(() => {
        balloonContainer.remove()
    }, 500)
}

// Efecto fireworks
const playFireworks = async () => {
    await tsParticles.load("tsparticles", {
        preset: "confetti",
        fullScreen: {
            enable: true
        },
        detectRetina: true,
        background: {
            color: "transparent"
        },
        fpsLimit: 60,
        emitters: {
            direction: "top",
            life: {
                count: 0,
                duration: 0.1,
                delay: 0.1
            },
            rate: {
                delay: 0.01,
                quantity: 1
            },
            size: {
                width: 100,
                height: 0
            },
            position: {
                y: 100,
                x: 50
            }
        },
        particles: {
            number: {
                value: 0
            },
            destroy: {
                mode: "split",
                split: {
                    count: 1,
                    factor: { value: 1 / 3 },
                    rate: {
                        value: 100
                    },
                    particles: {
                        color: {
                            value: ["#5bc0eb", "#fde74c", "#9bc53d", "#e55934", "#fa7921"]
                        },
                        stroke: {
                            width: 0
                        },
                        number: {
                            value: 0
                        },
                        collisions: {
                            enable: false
                        },
                        opacity: {
                            value: 1,
                            animation: {
                                enable: true,
                                speed: 0.6,
                                minimumValue: 0.1,
                                sync: false,
                                startValue: "max",
                                destroy: "min"
                            }
                        },
                        shape: {
                            type: "circle"
                        },
                        size: {
                            value: { min: 2, max: 3 },
                            animation: {
                                enable: false
                            }
                        },
                        life: {
                            count: 1,
                            duration: {
                                value: {
                                    min: 1,
                                    max: 2
                                }
                            }
                        },
                        move: {
                            enable: true,
                            gravity: {
                                enable: false
                            },
                            speed: 2,
                            direction: "none",
                            random: true,
                            straight: false,
                            outMode: "destroy"
                        }
                    }
                }
            },
            life: {
                count: 1
            },
            shape: {
                type: "line"
            },
            size: {
                value: { min: 1, max: 100 },
                animation: {
                    enable: true,
                    sync: true,
                    speed: 150,
                    startValue: "random",
                    destroy: "min"
                }
            },
            stroke: {
                color: {
                    value: "#303030"
                },
                width: 1
            },
            rotate: {
                path: true
            },
            move: {
                enable: true,
                gravity: {
                    acceleration: 15,
                    enable: true,
                    inverse: true,
                    maxSpeed: 100
                },
                speed: { min: 10, max: 20 },
                outModes: {
                    default: "destroy",
                    top: "none"
                },
                trail: {
                    fillColor: "transparent",
                    enable: true,
                    length: 10
                }
            }
        }
    });
}

// Animación Confetti
const showConfetti = () => {
    party.confetti(document.querySelector("#ruleta"), {
        count: party.variation.range(30, 60),
        size: party.variation.range(1, 2),
        spread: party.variation.range(20, 60),
    })
}

// Reiniciar Ruleta
const btnTryAgain = document.getElementById('try_again');
const partyConfetti = document.getElementById('tsparticles');
const tryAgain = () => {
    removeBalloons()
    d3.select('#tsparticles').remove()
    d3.select(".piece:nth-child(" + (elPicked + 1) + ") path").attr("stroke-width", "0");
    d3.select(".piece:nth-child(" + (elPicked + 1) + ") text").style({ "fill": "black", "font-size": "calc(1rem + 0.4vw)" });
    d3.select(".piece:nth-child(" + (elPicked + 1) + ")").style({ "transform": "scale(1)" })
    d3.select("#ruleta_result h1").text("¡Mucha suerte a los participantes!");
    d3.select("#ruleta_result h2").text("");
}
btnTryAgain.addEventListener('click', tryAgain)