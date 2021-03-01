very small lib that adds a global object PixiCollider


    const { outlines, simplified } = PixiCollider.fromSprite(sprite, 4);
    
or
    
    const { outlines, simplified } = PixiCollider.fromTexture(texture, 4);

or

    const { outlines, simplified } = PixiCollider.fromImage(image, 4);

Since a sprite can have multiple outlines, ie a hole in a donut or a texture with transparent space between pixels, all methods return an arrays, ```outlines``` and ```simplified```, each representing all of the polygons.
 
The second parameter determines the ```simplified``` result, the larger the number, the less lines each polygon inside the ```simplified ``` array will have. If you do not pass in a value, or pass in anything falsey, the ```simplified``` result will be null.

### NOTE: 
If your texture or sprite has already been rendered by a WebGL pixi renderer, you will have to pass in that renderer as the third param.

      const { outlines, simplified } = PixiCollider.fromSprite(sprite, 4, renderer);
      
