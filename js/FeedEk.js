/*
 * FeedEk jQuery RSS/ATOM Feed Plugin v3.0 with YQL API
 * http://jquery-plugins.net/FeedEk/FeedEk.html  https://github.com/enginkizil/FeedEk
 * Author : Engin KIZIL http://www.enginkizil.com
 */

(function ($) {
  $.fn.FeedEk = function (opt) {
    var def = $.extend({
      MaxCount: 5,
      ShowDesc: true,
      ShowPubDate: true,
      DescCharacterLimit: 0,
      TitleLinkTarget: "_blank",
      DateFormat: "",
      DateFormatLang: "en"
    }, opt);

    var id = $(this).attr("id"), s = "", dt;
    $("#" + id).empty();
    if (def.FeedUrl == undefined) return;
    $("#" + id).append('<img src="images/loader.gif" />'); // No image file?

    var YQLstr = 'SELECT channel.item FROM feednormalizer WHERE output="rss_2.0" AND url ="' + def.FeedUrl + '" LIMIT ' + def.MaxCount;

    return $.ajax({
      url: "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(YQLstr) + "&format=json&diagnostics=false&callback=?",
      dataType: "json",
      success: function (data) {
        var tmpCount = 1;
        $("#" + id).empty();
        if (!(data.query.results.rss instanceof Array)) {
          data.query.results.rss = [data.query.results.rss];
        }
        $.each(data.query.results.rss, function (e, itm) {

          if (def.MaxCount == 3) {
            s += '<div class="panel panel-default">';
            s += '<div class="itemTitle panel-heading"><a href="news.html#News' + tmpCount + '">' + itm.channel.item.title + '</a></div>';
            tmpCount++;
          }

          else {
            s += '<div class="panel panel-default">';
            s += '<div class="itemTitle panel-heading" id="News' + tmpCount + '"><a href="' + itm.channel.item.link + '">' + itm.channel.item.title + '</a></div>';
            tmpCount++;
          }

          s += '<div class="panel-body">';

          if (def.ShowPubDate) {
            dt = new Date(itm.channel.item.pubDate);
            s += '<div class="itemDate">';
            if ($.trim(def.DateFormat).length > 0) {
              try {
                moment.lang(def.DateFormatLang);
                s += moment(dt).format(def.DateFormat);
              }
              catch (e) {
                s += dt.toLocaleDateString();
              }
            }
            else {
              s += dt.toLocaleDateString();
            }
            s += '</div>';
          }
          if (def.ShowDesc) {
            s += '<div class="itemContent">';
            if (def.DescCharacterLimit > 0 && itm.channel.item.description.length > def.DescCharacterLimit) {
              var substr = itm.channel.item.description.substring(0, def.DescCharacterLimit);
              console.log(substr);
              s += '<p>' + substr + '...</p>';
            }
            else {
              s += itm.channel.item.description;
            }
            s += '</div>';
          }
          s += '</div>';
          s += "</div></div>";
        });


        $("#" + id).append('<' + def.Tag + '>' + s + '</ol>');
      }
    });
  };
})(jQuery);
