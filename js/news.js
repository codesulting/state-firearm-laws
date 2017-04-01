$(document).ready(function () {
  $('#divRssF').FeedEk({
    FeedUrl: 'http://tobaccoanalysis.blogspot.com/feeds/posts/default?alt=rss',
    MaxCount: 5,
    Tag: 'ul class="feedEkList"',
    DescCharacterLimit: 1000
  }).done(function () {
    // Scroll to news item after click on recent news
    document.location.hash && scrollPage(document.location.hash);
  });

  function scrollPage(hash) {
    // $().scrollTop() jumps to top again for some reason, use animate with 100 ms duration as workaround
    $('html, body').animate({scrollTop: $(hash).offset().top}, 100);
  }
});




