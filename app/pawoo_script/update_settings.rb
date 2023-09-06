class UpdateSettings
  def self.update_site_terms
    sql_query = <<-HEREDOC
        update settings set value = '--- "<p>2Pawooのプライバシーポリシーは以下に記載しています。</p>\r\n<p><a href=\"http://www.russel.co.jp/kojinn.html\" target=\"_blank\">http://www.russel.co.jp/kojinn.html</a></p>"' where var = 'site_terms'
    HEREDOC
    ActiveRecord::Base.connection.execute(sql_query)
  end

  def self.update_site_short_desc
    sql_query = <<-HEREDOC
        update settings set value = '--- "<p>\r\n1The Social Coop Limited が運営するマストドンインスタンス「Pawoo」は、文章や画像を投稿して楽しむSNSです。\r\n「創作活動や自由なコミュニケーションを楽しめる場」として、どなたにも幅広く使っていただけます。\r\n\r\n</p>\r\n<br/>\r\n\r\n<h2>18歳未満に見せるべきではないコンテンツを投稿する場合</h2>\r\n<p>文章の投稿には「CW」、画像の投稿には「メディアを閲覧注意にする」を必ず設定してください。</p>\r\n<br/>\r\n\r\n<h2>禁止行為</h2>\r\n<ul>\r\n<li>公序良俗に反する行為</li>\r\n<li>日本国内の法律に違反する行為</li>\r\n<li>他者に中傷・脅迫・経済的もしくは精神的に損害や不利益を与える行為</li>\r\n<li>実在の人物・団体などになりすます行為</li>\r\n<li>他者の著作物を無断転載する行為</li>\r\n<li>サーバに極端な負荷をかける行為</li>\r\n</ul>"' where var = 'site_extended_description'
    HEREDOC
    ActiveRecord::Base.connection.execute(sql_query)
  end

  def self.update_site_desc
    sql_query = <<-HEREDOC
        update settings set value = '--- "The Social Coop Limited が運営するマストドンインスタンス「Pawoo」は、文章や画像を投稿して楽しむSNSです。\r\n「創作活動や自由なコミュニケーションを楽しめる場」として、どなたにも幅広く使っていただけます。"' where var = 'site_description'
    HEREDOC
    ActiveRecord::Base.connection.execute(sql_query)
  end
end