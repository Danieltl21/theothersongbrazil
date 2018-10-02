
<!------ Include the above in your HEAD tag ---------->
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>The Other Song Brazil</title>

    <link rel="icon" href="img/icone.png" type="image/png">
    <link rel="stylesheet" type="text/css" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/modernizr/2.8.3/modernizr.min.js" type="text/javascript"></script>

</head>
<body>


	<style type="text/css">
/* Global */
html { font-size: 100% !important; }
body {
    background: #3399cc;
    padding: 40px;
}  

img { max-width:100%; }

a {
  -webkit-transition: all 150ms ease;
  -moz-transition: all 150ms ease;
  -ms-transition: all 150ms ease;
  -o-transition: all 150ms ease;
  transition: all 150ms ease; 
  }
    a:hover {
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=50)"; /* IE 8 */
        filter: alpha(opacity=50); /* IE7 */
        opacity: 0.6;
        text-decoration: none;
    }


/* Container */
.container {
    background: #FFFFFF;
    margin: 40px auto;
    padding: 20px 40px 50px;
    max-width: 960px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}



/* Page Header */
.page-header {
    background: #f9f9f9;
    margin: -30px -40px 40px;
    padding: 20px 40px;
    border-top: 4px solid #ccc;
    color: #999;
    text-transform: uppercase;
    }
    .page-header h3 {
        line-height: 0.88rem;
        color: #000;
        }



/* Boxes
------------------------------------------------ */

/* List style */
ul.thumbnails { 
  list-style: none; 
  margin: 0;
  padding: 0;
  }

.caption-box h4 {
    font-size: 0.94rem;
    color: #444;
    }
    .caption-box p {
        font-size: 0.75rem;
        color: #999;
        }
        .btn.btn-mini {
            font-size: 0.63rem;
            }



/* Control box 
------------------------------------------------ */
.control-box {
    width: 100%;
    }
    .carousel-control{
        background: #666 !important;
        border: 0px;
        border-radius: 0px;
        display: inline-block;
        font-size: 34px;
        font-weight: 200;
        line-height: 18px;
        opacity: 0.5;
        padding: 4px 10px;
        margin: 30px -20px 0;
        height: 30px;
        width: 30px;
        }



/* Mobile only
------------------------------------------------ */
@media (max-width: 767px) {
    .page-header { text-align: center; } 
}
@media (max-width: 479px) {
    .caption-box { word-break: break-all; }
    ul.thumbnails li { margin-bottom: 30px; }
}


/* Footer 
------------------------------------------------ */
footer.info { text-align: center; color: #888; margin: 30px 0; }
footer.info a { color: #fff; }
footer.info p { color: #ccc; margin: 10px 0; }



/* ADD-ON
------------------------------------------------ */
body:after{content:"less than 320px";font-size:1rem;font-weight:bold;position:fixed;bottom:0;width:100%;text-align:center;background-color:hsla(1,60%,40%,0.7);color:#fff;height:20px;padding-top:0;margin-left:0;left:0}@media only screen and (min-width:320px){body:after{content:"320 to 480px";background-color:hsla(90,60%,40%,0.7);height:20px;padding-top:0;margin-left:0}}@media only screen and (min-width:480px){body:after{content:"480 to 768px";background-color:hsla(180,60%,40%,0.7);height:20px;padding-top:0;margin-left:0}}@media only screen and (min-width:768px){body:after{content:"768 to 980px";background-color:hsla(270,60%,40%,0.7);height:20px;padding-top:0;margin-left:0}}@media only screen and (min-width:980px){body:after{content:"980 to 1024px";background-color:hsla(300,60%,40%,0.7);height:20px;padding-top:0;margin-left:0}}@media only screen and (min-width:1024px){body:after{content:"1024 and up";background-color:hsla(360,60%,40%,0.7);height:20px;padding-top:0;margin-left:0}}

::selection { background: #ff5e99; color: #FFFFFF; text-shadow: 0; }
::-moz-selection { background: #ff5e99; color: #FFFFFF; }

a, a:focus, a:active, a:hover, object, embed { outline: none; }
:-moz-any-link:focus { outline: none; }
input::-moz-focus-inner { border: 0; }
</style>

<div class="container">
<div class="row">
<div class="col-sm-12">

    <div class="page-header">
        <h3>Bootstrap 3</h3>
        <p>Responsive Moving Box Carousel Demo</p>
    </div>
        



  <div id="myCarousel" class="row carousel slide" data-ride="carousel">

    <!-- Wrapper for slides -->
    <div class="carousel-inner">

      <div class="item active">
        
        <ul class="thumbnails">
          <li class="col-sm-3">      
            <div class="thumbnail">
              <a href="#"><img src="http://placehold.it/360x240" alt=""></a>
            </div>
            <div class="caption-box">
              <h4>Praesent commodo</h4>
              <p>Nullam Condimentum Nibh Etiam Sem</p>
              <a class="btn btn-success btn-mini" href="#">Read More</a>
            </div>
          </li>

          <li class="col-sm-3">      
            <div class="thumbnail">
              <a href="#"><img src="http://placehold.it/360x240" alt=""></a>
            </div>
            <div class="caption-box">
              <h4>Praesent commodo</h4>
              <p>Nullam Condimentum Nibh Etiam Sem</p>
              <a class="btn btn-success btn-mini" href="#">Read More</a>
            </div>
          </li>

          <li class="col-sm-3">      
            <div class="thumbnail">
              <a href="#"><img src="http://placehold.it/360x240" alt=""></a>
            </div>
            <div class="caption-box">
              <h4>Praesent commodo</h4>
              <p>Nullam Condimentum Nibh Etiam Sem</p>
              <a class="btn btn-success btn-mini" href="#">Read More</a>
            </div>
          </li>

          <li class="col-sm-3">      
            <div class="thumbnail">
              <a href="#"><img src="http://placehold.it/360x240" alt=""></a>
            </div>
            <div class="caption-box">
              <h4>Praesent commodo</h4>
              <p>Nullam Condimentum Nibh Etiam Sem</p>
              <a class="btn btn-success btn-mini" href="#">Read More</a>
            </div>
          </li>
        </ul>
      </div><!-- /Slide1 --> 


      <div class="item">
        <ul class="thumbnails">
          <li class="col-sm-3">      
            <div class="thumbnail">
              <a href="#"><img src="http://placehold.it/360x240" alt=""></a>
            </div>
            <div class="caption-box">
              <h4>Praesent commodo</h4>
              <p>Nullam Condimentum Nibh Etiam Sem</p>
              <a class="btn btn-success btn-mini" href="#">Read More</a>
            </div>
          </li>

          <li class="col-sm-3">      
            <div class="thumbnail">
              <a href="#"><img src="http://placehold.it/360x240" alt=""></a>
            </div>
            <div class="caption-box">
              <h4>Praesent commodo</h4>
              <p>Nullam Condimentum Nibh Etiam Sem</p>
              <a class="btn btn-success btn-mini" href="#">Read More</a>
            </div>
          </li>

          <li class="col-sm-3">      
            <div class="thumbnail">
              <a href="#"><img src="http://placehold.it/360x240" alt=""></a>
            </div>
            <div class="caption-box">
              <h4>Praesent commodo</h4>
              <p>Nullam Condimentum Nibh Etiam Sem</p>
              <a class="btn btn-success btn-mini" href="#">Read More</a>
            </div>
          </li>

          <li class="col-sm-3">      
            <div class="thumbnail">
              <a href="#"><img src="http://placehold.it/360x240" alt=""></a>
            </div>
            <div class="caption-box">
              <h4>Praesent commodo</h4>
              <p>Nullam Condimentum Nibh Etiam Sem</p>
              <a class="btn btn-success btn-mini" href="#">Read More</a>
            </div>
          </li>
        </ul>
      </div><!-- /Slide2 --> 


      <div class="item">
        <ul class="thumbnails">
          <li class="col-sm-3">      
            <div class="thumbnail">
              <a href="#"><img src="http://placehold.it/360x240" alt=""></a>
            </div>
            <div class="caption-box">
              <h4>Praesent commodo</h4>
              <p>Nullam Condimentum Nibh Etiam Sem</p>
              <a class="btn btn-success btn-mini" href="#">Read More</a>
            </div>
          </li>

          <li class="col-sm-3">      
            <div class="thumbnail">
              <a href="#"><img src="http://placehold.it/360x240" alt=""></a>
            </div>
            <div class="caption-box">
              <h4>Praesent commodo</h4>
              <p>Nullam Condimentum Nibh Etiam Sem</p>
              <a class="btn btn-success btn-mini" href="#">Read More</a>
            </div>
          </li>

          <li class="col-sm-3">      
            <div class="thumbnail">
              <a href="#"><img src="http://placehold.it/360x240" alt=""></a>
            </div>
            <div class="caption-box">
              <h4>Praesent commodo</h4>
              <p>Nullam Condimentum Nibh Etiam Sem</p>
              <a class="btn btn-success btn-mini" href="#">Read More</a>
            </div>
          </li>

          <li class="col-sm-3">      
            <div class="thumbnail">
              <a href="#"><img src="http://placehold.it/360x240" alt=""></a>
            </div>
            <div class="caption-box">
              <h4>Praesent commodo</h4>
              <p>Nullam Condimentum Nibh Etiam Sem</p>
              <a class="btn btn-success btn-mini" href="#">Read More</a>
            </div>
          </li>
        </ul>
      </div><!-- /Slide3 --> 



    </div><!-- /Wrapper for slides .carousel-inner -->



    <!-- Control box -->
    <div class="control-box">                            
      <a data-slide="prev" href="#myCarousel" class="carousel-control left">‹</a>
      <a data-slide="next" href="#myCarousel" class="carousel-control right">›</a>
    </div><!-- /.control-box -->   



  </div><!-- /#myCarousel -->


</div><!-- /.col-sm-12 -->          
</div><!-- /.row --> 
</div><!-- /.container -->

                            
<!-- Delete This -->                        
<footer class="info">
<a href="http://simonalex.com/">&hearts; Redfrost</a> | <a href="https://twitter.github.com/bootstrap/">Get Bootstrap</a> | <a href="http://placehold.it/">Get Placeholder</a>   
    <p class="right">&lsaquo; Resize Window &rsaquo;</p>
    <p>&nbsp;</p>
</footer>
<script
  src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
  <script
  src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
<script type="text/javascript">


// Carousel Auto-Cycle
  $(document).ready(function() {
    $('.carousel').carousel({
      interval: 6000
    })
  });


</script>
</body>
</html>