import React, { useEffect } from 'react';
import './ClickRayEffect.css';

const ClickRayEffect: React.FC = () => {
    useEffect(() => {
        const NUM_RAYS = 4;
        const RAY_WIDTH = 8;
        const RAY_HEIGHT = 4;
        const RAY_SPREAD_ANGLE = 135; // 135 ideal
        const TRAVEL_DISTANCE = 20;
        const INITIAL_DISTANCE = 5;
        const ANIMATION_DURATION = 400; // animation duration in ms

        let recentlyClicked = false;

        const handleMouseDown = (event: MouseEvent) => {
            if (recentlyClicked) return;

            recentlyClicked = true;

            setTimeout(() => {
                recentlyClicked = false;
            }, 111);

            const clickX = event.clientX;
            const clickY = event.clientY;

            const angles = calculateRayAngles(NUM_RAYS, 245, RAY_SPREAD_ANGLE);

            for (let i = 0; i < NUM_RAYS; i++) {
                const ray = document.createElement('div');
                ray.classList.add('ray');
                document.body.appendChild(ray);

                // initial position with starting distance
                const initialOffsetX = Math.cos(angles[i] * (Math.PI / 180)) * INITIAL_DISTANCE;
                const initialOffsetY = Math.sin(angles[i] * (Math.PI / 180)) * INITIAL_DISTANCE;

                // final position with total travel distance
                const finalOffsetX = Math.cos(angles[i] * (Math.PI / 180)) * (INITIAL_DISTANCE + TRAVEL_DISTANCE);
                const finalOffsetY = Math.sin(angles[i] * (Math.PI / 180)) * (INITIAL_DISTANCE + TRAVEL_DISTANCE);

                // set initial styles
                ray.style.position = 'fixed'; // ensure fixed positioning
                ray.style.zIndex = '999999'; // max z-index value
                ray.style.pointerEvents = 'none';
                ray.style.backgroundColor = '#fff';
                ray.style.width = `${RAY_WIDTH}px`;
                ray.style.height = `${RAY_HEIGHT}px`;
                ray.style.left = `${clickX - (RAY_WIDTH / 2) + initialOffsetX}px`;
                ray.style.top = `${clickY - (RAY_HEIGHT / 2) + initialOffsetY}px`;
                ray.style.transformOrigin = 'center';
                ray.style.transform = `rotate(${angles[i]}deg)`;
                ray.style.opacity = '1';

                // add transition properties for smooth animation
                ray.style.transition = `
                    left ${ANIMATION_DURATION}ms cubic-bezier(0, 0, 0.2, 1),
                    top ${ANIMATION_DURATION}ms cubic-bezier(0, 0, 0.2, 1),
                    transform ${ANIMATION_DURATION}ms cubic-bezier(1, 0.2, 0.5, 0.8),
                    opacity ${ANIMATION_DURATION}ms cubic-bezier(1, -0.01, 1, 1)
                `;

                // force a reflow to ensure the initial properties are applied before the animation
                ray.offsetHeight;

                // set the final styles to animate to
                requestAnimationFrame(() => { // first RAF to ensure the initial properties are applied
                    requestAnimationFrame(() => { // second RAF to ensure the animation kicks in smoothly
                        ray.style.left = `${clickX - (RAY_WIDTH / 2) + finalOffsetX}px`;
                        ray.style.top = `${clickY - (RAY_HEIGHT / 2) + finalOffsetY}px`;
                        ray.style.transform = `rotate(${angles[i]}deg) scale(0)`;
                        ray.style.opacity = '0';
                    });
                });

                // remove the ray from the DOM after animation completes
                ray.addEventListener('transitionend', () => {
                    if (ray.parentNode) {
                        ray.parentNode.removeChild(ray);
                    }
                }, { once: true }); // { once: true } ensures the event listener is removed after the first trigger
            }
        };

        document.addEventListener('mousedown', handleMouseDown, true);

        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleMouseDown, true);
        };
    }, []);

    return null; // This component handles DOM manipulation purely; no render required
};

function calculateRayAngles(numberOfRays: number, centerAngleDeg: number, spreadAngleDeg: number): number[] {
    const angles: number[] = [];

    // handle cases with no rays or invalid input
    if (numberOfRays <= 0) {
        return angles; // return an empty array
    }

    // if there's only one ray, it points directly at the center angle
    if (numberOfRays === 1) {
        angles.push(centerAngleDeg);
        return angles;
    }

    // calculate the angle of the very first ray in the fan.
    // this is half the spread to the "left" (counter-clockwise for formula, but visually depends on angle system)
    // of the center angle.
    const firstRayAngle = centerAngleDeg - (spreadAngleDeg / 2);

    // calculate the angular step (increment) between consecutive rays.
    // if spreadAngleDeg is 0, all rays will have the same angle as firstRayAngle (which is centerAngleDeg).
    const angleStep = spreadAngleDeg / (numberOfRays - 1);

    // calculate the angle for each ray
    for (let i = 0; i < numberOfRays; i++) {
        const rayAngle = firstRayAngle + (i * angleStep);
        angles.push(rayAngle);
    }

    return angles;
}

export default ClickRayEffect;
