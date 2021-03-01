PIXI.loader.add('bunny', 'bunny.png').load(() => {
    const bunnyTexture = PIXI.loader.resources.bunny.texture;
    const app = new PIXI.Application(500, 500, {backgroundColor: 0x1099bb, roundPixels: true });
    document.body.appendChild(app.view);
    console.log(PIXI.loader)
    const bunny1 = new PIXI.Sprite(bunnyTexture);
    bunny1.x = 100;
    bunny1.y = 150;
    bunny1.scale.set(2, 2);
    const bunny2 = new PIXI.Sprite(bunnyTexture);
    bunny2.x = 200;
    bunny2.y = 250;
    bunny2.scale.set(3, 3);

    const { outlines: fromTexture } = PixiCollider.fromTexture(bunnyTexture);
    const { outlines: fromSprite } = PixiCollider.fromSprite(bunny1);
    const { simplified: fromSprite2 } = PixiCollider.fromSprite(bunny2, 4);
    const g = new PIXI.Graphics();

    const drawLines = (lineData, color) => {
        g.lineStyle(2, color);
        g.moveTo(lineData[0].x, lineData[0].y);
        for(let i = 1; i < lineData.length; i++) {
            g.lineTo(lineData[i].x, lineData[i].y)
        }
    }

    fromTexture.forEach(lineData => {
        drawLines(lineData, 0xff0000)
    });
    fromSprite.forEach(lineData => {
        drawLines(lineData, 0x00ff00)
    });
    fromSprite2.forEach(lineData => {
        drawLines(lineData, 0x00ff00)
    });

    app.stage.addChild(bunny1);
    app.stage.addChild(bunny2);
    app.stage.addChild(g);

    setInterval(() => {
        app.renderer.render(app.stage);
    });
})