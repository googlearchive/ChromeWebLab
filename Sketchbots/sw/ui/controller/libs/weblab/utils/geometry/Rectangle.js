(function(){
	
	/**
	 * [ns description]
	 * @type {[type]}
	 * @author 
	 */
	
	var ns = WEBLAB.namespace( 'WEBLAB.utils.geometry' );

	if( ns.Rectangle === undefined )
	{

		var point = 
		ns.Rectangle = function( x, y, width, height )
		{
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}

		var p = ns.Rectangle.prototype;

		p.getCenter = function()
		{
			return {
                    x: this.x + (this.width / 2),
                    y: this.y + (this.height / 2)
            };
		}

		p.contains = function (x, y) {
			return ( x >= this.x && y >= this.y && y <= this.y + this.height && this.x <= this.x + this.width );
        }

        p.getArea = function()
        {
        	return this.width * this.height;
        }
	}

}());