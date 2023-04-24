import { data } from './data.js'

// RULETA
const colors = d3.scale.ordinal().range(["#000000", "#006BBB", "#E20715"]);

// 1. Agrega el elemento SVG
const paddingRuleta = { top: 0, right: 20, bottom: 0, left: 20 };
const heightScreen = document.querySelector("#ruleta").clientHeight - 25;
const widthScreen = document.querySelector("#ruleta").clientWidth - 25;
const whScreen = Math.min(widthScreen, heightScreen);

const wRuleta = whScreen - paddingRuleta.left - paddingRuleta.right;
const hRuleta = whScreen - paddingRuleta.top - paddingRuleta.bottom;
const rRuleta = Math.min(wRuleta, hRuleta) / 2;
const svgRuleta = d3.select('#ruleta').append("svg").data([data])
    .attr("width", whScreen).attr("height", whScreen).style({ "display": "block", "margin-left": "auto" });

// 2. Agrega el contenido (piezas) de la ruleta
const contentRuleta = svgRuleta.append("g").attr('id', 'content').attr("transform", "translate(" + (wRuleta / 2) + "," + (hRuleta / 2) + ")");
const visRuleta = contentRuleta.append("g").attr('id', 'vis');

// 3. Agrega el gráfico de torta
const pieRuleta = d3.layout.pie().sort(null).value((d) => 1);
// 3.1. Genera el contenido de la ruleta
const arcRuleta = d3.svg.arc().outerRadius(rRuleta);
const arcsRuleta = visRuleta.selectAll("g.piece").data(pieRuleta).enter().append("g").attr("class", "piece");
arcsRuleta.append("path").attr("fill", (d, i) => colors(i)).attr("d", (d) => arcRuleta(d));

// 4. Borde amarillo de la ruleta
const borderWidth = whScreen * 0.025;
const outerRadiusRuleta = Math.min(wRuleta, hRuleta) / 2 - borderWidth;
const arcBorderRuleta = d3.svg.arc().innerRadius(outerRadiusRuleta).outerRadius(outerRadiusRuleta + borderWidth);
arcsRuleta.append("path").attr("fill", "#FFBE0B").attr("d", arcBorderRuleta);

// 5. Agrega el texto de los departamentos
arcsRuleta.append("text").attr("transform", (d) => {
    d.innerRadius = 0;
    d.outerRadius = rRuleta;
    d.angle = (d.startAngle + d.endAngle) / 2;
    return "rotate(" + ((d.angle * 180 / Math.PI - 90) + 2) + ")translate(" + (d.outerRadius - (borderWidth + 25)) + ")";
})
    .attr("text-anchor", "end")
    .attr("class", "piece_not_selected")
    .text((d, i) => data[i].local);

// 6. Flecha indicador Ganador
svgRuleta.append("g")
    .attr("transform", "translate(" + (wRuleta + paddingRuleta.left + paddingRuleta.right) + "," + ((hRuleta / 2) + paddingRuleta.top) + ")")
    .append("path")
    .attr("d", "M-" + (rRuleta * .15) + ",0L0," + (rRuleta * .05) + "L0,-" + (rRuleta * .05) + "Z")
    .style({ "fill": "#515AA4" });

// 7. Botón Spin Jugar
contentRuleta.append("circle").attr("cx", 0).attr("cy", 0).attr("r", whScreen * 0.09).attr("class", "circle");

// 8. Texto Spin Jugar
contentRuleta.append("text").attr("id", "text_jugar").attr("x", 0).attr("y", whScreen * 0.025 / 2).attr("text-anchor", "middle").text("Jugar");

// 9. Función Spin para girar la ruleta
let elPicked = 100000;
let rotation = 0
let oldRotation = 0;
let oldpick = [];
const spinRuleta = (d) => {
    d3.select("#ruleta").style({ "transform": "scale(1)" });

    // Fin del sorteo
    if (oldpick.length == data.length) {
        console.log("Fin, no quedan más opciones...");
        contentRuleta.on("click", null);
        return;
    }

    const ps = 360 / data.length;
    const range = Math.floor((Math.random() * 1440) + 360);
    rotation = (Math.round(range / ps) * ps);
    elPicked = Math.round(data.length - (rotation % 360) / ps);
    elPicked = elPicked >= data.length ? (elPicked % data.length) : elPicked;

    // Guarda sorteo para que no se repita
    if (oldpick.indexOf(elPicked) !== -1) {
        d3.select(this).call(spinRuleta);
        return;
    } else {
        oldpick.push(elPicked);
    }

    rotation += 90 - Math.round(ps / 2);
    visRuleta.transition().duration(3500).attrTween("transform", rotationTween).each("end", () => {
        // 9.1. Marcar resultado final
        const pickedTacna = 22;
        d3.select(".piece:nth-child(" + (elPicked + 1) + ") path").attr('class', 'piece_container_selected');
        d3.select(".piece:nth-child(" + (elPicked + 1) + ") text").attr('class', 'piece_selected')
            .attr("transform", (d) => {
                d.innerRadius = 0;
                d.outerRadius = rRuleta;
                d.angle = (d.startAngle + d.endAngle) / 2;
                return "rotate(" + ((d.angle * 180 / Math.PI - 90) + 2) + ")translate(" + (d.outerRadius - (borderWidth + (whScreen * 0.05))) + ")";
            });
        // 9.2. Imprime en pantalla el resultado
        d3.select("#ruleta_result h1").text("¡Felicidades ud. ha ganado!");
        d3.select("#ruleta_result h2").text("Local: " + data[elPicked].local);

        // 9.3. Cambia el contenido del botón Spin x una imagen
        contentRuleta.append("svg:image")
            .attr("id", "gift")
            .attr("xlink:href", "gift.svg")
            .attr("width", whScreen * 0.09)
            .attr("height", whScreen * 0.09)
            .attr("x", whScreen * -0.09 / 2)
            .attr("y", whScreen * -0.09 / 2)
            .style({ "cursor": "pointer" });
        d3.select("#text_jugar").style({ "display": "none" }); // Oculta el texto del botón Spin

        // Efecto Fireworks
        playFireworks()
        // Animación Party Confetti
        showConfetti()
        // Animación Globos Random
        createBalloons(30)

        d3.select("#ruleta").style({ "transform": "scale(0.95)" })
        oldRotation = rotation;
        // contentRuleta.on("click", null);
    });
}

const rotationTween = () => {
    const rotationTacna = 1207;
    // const i = d3.interpolate(0, rotationTacna);
    const i = d3.interpolate(oldRotation % 360, rotation);
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
    !balloonContainer && document.createElement("div").id('balloon_container');
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
    balloonContainer.textContent = '';
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

const removeFireworks = () => {
    d3.select('#tsparticles').remove()
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
const tryAgain = () => {
    removeBalloons()
    removeFireworks()
    d3.select(".piece:nth-child(" + (elPicked + 1) + ") path").attr("stroke-width", "0");
    d3.select(".piece:nth-child(" + (elPicked + 1) + ") path").classed('piece_container_selected', false);
    d3.select(".piece:nth-child(" + (elPicked + 1) + ") text").classed('piece_not_selected', true);
    d3.select(".piece:nth-child(" + (elPicked + 1) + ")").style({ "transform": "scale(1)" })
    d3.select("#ruleta_result h1").text("¡Mucha suerte a los participantes!");
    d3.select("#ruleta_result h2").text("");
    d3.select("#gift").remove();
    d3.select("#text_jugar").style({ "display": "block" });
}
btnTryAgain.addEventListener('click', tryAgain);