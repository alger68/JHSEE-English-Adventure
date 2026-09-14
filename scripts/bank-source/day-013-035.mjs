// Original teaching content. Correct choice comes first here; the compiler shuffles
// choices and moves the corresponding rationale with each choice before export.
const vocabulary = entries => entries.map(([word, meaning, example]) => ({word, meaning, example}));
const phrases = entries => entries.map(([phrase, meaning]) => ({phrase, meaning}));
const skillNames = {D:'細節理解',I:'推論判讀',V:'字義推測',M:'主旨統整',X:'資訊整合'};
const q = (skill, prompt, options, explanation, evidence, reasons) => ({skill:skillNames[skill], prompt, options, explanation, evidence, reasons});
const lesson = (day, title, goal, story, words, phraseEntries, questions) => ({day,title,goal,story,words:vocabulary(words),phrases:phrases(phraseEntries),questions});

export const authoredLessons = [
lesson(13, 'The Extra Point', '分辨發現錯誤、修正行動與公平理由。',
`Every Monday, Amy counts the points for her class reading game. Students earn one point for each book report. This week, her friend Ben gives her two reports, but Amy writes three points beside his name. Ben notices the extra point during lunch.

At first, he says nothing. His team is only one point behind the leaders. Then he remembers the rule they all agreed on: every point needs a finished report. He tells Amy about the mistake before the final scores go on the classroom wall.

Amy thanks him and changes the number. Their team does not win that week, but the game stays fair. On Tuesday, Ben brings another report. This time, he knows exactly why his team receives its next point.`,
[['earn','獲得；賺得','Students earn points by finishing reports.'],['extra','額外的','There is an extra chair near the door.'],['notice','注意到','I notice a mistake in the list.'],['rule','規則','Everyone follows the same rule.'],['fair','公平的','A fair game uses the same rules for everyone.']],
[['at first','起初'],['agree on','對……取得共識']], [
q('D','How many reports does Ben give Amy on Monday?', ['Two.','One.','Three.','Four.'], 'Ben 交了兩份；三是 Amy 誤記的分數。','This week, her friend Ben gives her two reports, but Amy writes three points beside his name.', ['原文 two reports。','一是落後分差，不是報告數。','三是誤記分數。','文中沒有四份報告。']),
q('D','When does Ben tell Amy about the mistake?', ['Before the final scores are posted.','After his team wins the game.','When he brings a report on Tuesday.','Before he gives her any reports.'], '他在最後分數公布前主動告知。','He tells Amy about the mistake before the final scores go on the classroom wall.', ['對應 before the final scores。','他的隊伍沒有贏。','告知在星期一，星期二是新報告。','他已交兩份才發現錯誤。']),
q('I','Why is the extra point tempting for Ben?', ['It could help his team catch the leaders.','It would let him stop writing forever.','It would change the rules for everyone.','It could make Amy finish his reports.'], '只落後一分，額外一分可能追平，這解釋他起初猶豫。','At first, he says nothing. His team is only one point behind the leaders.', ['一分差距支持此推論。','沒有永久不用寫的規定。','他們仍遵守原規則。','Amy 負責記分，不是代寫。']),
q('V','What does “fair” mean in this story?', ['Following rules equally for everyone.','Taking a long time to finish.','Having the largest number of players.','Being easier for Ben’s team.'], '修正多算的一分，讓各隊依同一規則計分。','Their team does not win that week, but the game stays fair.', ['公平來自相同計分規則。','文中不是討論比賽長短。','人數不是 fair 的意思。','偏袒 Ben 的隊伍不公平。']),
q('X','How many points should Ben’s three reports earn altogether?', ['Three points.','Two points.','Four points.','Five points.'], '星期一兩份加星期二一份，共三份；每份一分。','Students earn one point for each book report.', ['2＋1＝3，每份一分。','漏了星期二那份。','把誤記分數也保留了。','沒有五份完成報告。']),
q('M','Which title also fits the whole story?', ['A Point That Has to Be Earned','How to Finish Three Reports at Lunch','A New Rule for the Winning Team','The Day Amy Stops Counting'], '全文從誤記分數到修正，再到靠新報告得分，核心是得分須有依據。','This time, he knows exactly why his team receives its next point.', ['涵蓋錯分修正與實際努力。','不是午餐時完成三份報告。','規則一開始就存在。','Amy 沒有停止記分。'])
]),
lesson(14, 'Two Loaves at the Door', '分辨重複配送、原訂數量與負責處理。',
`On Tuesdays, Leo usually collects a loaf of bread for his grandmother. Today, a delivery worker leaves two bags outside her door. Each bag holds one loaf and a note with the same order number. Grandmother paid for only one loaf.

Leo wants to open both bags because he is hungry. His grandmother asks him to check the order first. He calls the bakery and reads the number aloud. The baker checks her list and explains that a new worker packed the order twice.

She asks Leo to keep one bag sealed. A worker will collect it before four. Leo puts it on a shelf away from the lunch table. When the worker arrives, Leo hands it back. His grandmother cuts their own loaf, and they share it with some soup.`,
[['collect','領取；收取','Leo collects bread for his grandmother.'],['order','訂單','The order contains one loaf.'],['check','核對；檢查','Please check the number on the bag.'],['sealed','密封的；未拆封的','The sealed bag is still closed.'],['shelf','架子','Put the bag on the shelf.']],
[['read aloud','大聲讀出'],['hand back','交還']], [
q('D','How much bread did Grandmother order?', ['One loaf.','Two loaves.','Three loaves.','No bread.'], '祖母只付了一條麵包的錢。','Grandmother paid for only one loaf.', ['原文 only one loaf。','兩條是實際誤送數量。','沒有三條。','她確實有訂麵包。']),
q('D','What information does Leo give the bakery?', ['The order number.','The worker’s home address.','The price of the soup.','His grandmother’s age.'], '他讀出袋上訂單號碼來查核。','He calls the bakery and reads the number aloud.', ['前文說袋上有相同訂單號碼。','沒有工人的住址。','湯在最後才出現。','沒有詢問年齡。']),
q('I','Why does Leo put one bag away from the lunch table?', ['To keep it unopened for collection.','To hide all the bread from Grandmother.','To let the bread cool in the soup.','To prepare another delivery order.'], '店家要求保留密封，他把袋子分開以免當午餐拆開。','She asks Leo to keep one bag sealed. A worker will collect it before four.', ['與保留密封、等候收回一致。','另一條仍和祖母分享。','沒有將麵包放入湯中降溫。','Leo 不是在出貨。']),
q('V','What does “sealed” mean here?', ['Not opened.','Already eaten.','Very expensive.','Written by hand.'], '袋子要等工作人員取回，sealed 指維持未拆封。','She asks Leo to keep one bag sealed.', ['與暫時不拆袋的情境一致。','吃完不能交回完整袋子。','不是描述價格。','不是描述書寫方式。']),
q('X','What best shows that the second loaf was a packing mistake?', ['The bakery confirms that one order was packed twice.','Leo collects bread every Tuesday.','Grandmother has soup for lunch.','A worker arrives before four.'], '相同訂單號碼提供線索；店家核對後確認重複包裝，證據最直接。','The baker checks her list and explains that a new worker packed the order twice.', ['店家核對紀錄後明確確認。','固定收麵包不能證明多包。','午餐內容與訂單無關。','取回時間本身不說明成因。']),
q('M','What is the main lesson of Leo’s experience?', ['Check an unexpected delivery before using it.','Always order extra food for visitors.','Never accept bread from a new worker.','Finish lunch before calling a shop.'], '全文重點是先確認多收到的東西，再依店家說明處理。','His grandmother asks him to check the order first.', ['涵蓋發現、查核與歸還。','不是鼓勵額外訂餐。','不能因一次失誤否定所有新員工。','他先打電話才吃午餐。'])
]),
lesson(15, 'The Photo We Can Share', '從對話中辨識同意範圍與最後決定。',
`Mia: I have a great photo of our class garden. Can I put it on the school website?
Owen: Does it show anyone’s face?
Mia: Yes. You and Sara are standing beside the flowers.
Owen: I am happy for you to share my picture, but please ask Sara too.
Mia: I asked her to join the photo yesterday. Isn’t that enough?
Owen: Joining a photo and putting it online are different choices.
Sara: Thanks for checking. I don’t want my face on a public website. Could you use the photo of the flowers alone?
Mia: Sure. I can choose that one instead and keep this picture in our private class folder.
Sara: That works for me. Please also leave our names out of the public post.
Mia: Okay. The post will describe the garden, not the students.`,
[['share','分享','Ask before you share someone’s picture.'],['public','公開的','Anyone can read the public post.'],['private','私人的；非公開的','The class uses a private folder.'],['instead','改用；代替','We can use the flower photo instead.'],['describe','描述','The post will describe the garden.']],
[['leave out','省略；不包含'],['be happy to','樂意……']], [
q('D','Where does Mia first want to put the photo?', ['On the school website.','On a bakery door.','Inside a science textbook.','In a garden shop window.'], '開頭 Mia 明確詢問能否放上學校網站。','Can I put it on the school website?', ['原文明說 school website。','沒有麵包店。','沒有教科書用途。','不是花店櫥窗。']),
q('D','Which photo will the public post use?', ['The photo of the flowers alone.','The photo of Mia’s family.','The photo of Owen and Sara beside the flowers.','The photo of the private folder.'], 'Sara 提議只用花的照片，Mia 同意。','Could you use the photo of the flowers alone?', ['下一句 Mia 回覆同意選這張。','沒有 Mia 家人照片。','這張將留在班級私人資料夾。','資料夾不是照片主題。']),
q('I','Why does Owen ask Mia to check with Sara?', ['Sara should decide how her own picture is used.','Sara owns the school website.','Owen dislikes every garden photo.','Mia has forgotten where the garden is.'], 'Owen 區分參與拍照和同意公開的選擇，不能替 Sara 決定。','Joining a photo and putting it online are different choices.', ['兩種選擇各自需要確認。','沒有說 Sara 擁有網站。','他同意分享自己的照片。','地點不是對話問題。']),
q('V','What does “private” mean in “private class folder”?', ['Not open to everyone.','Filled only with flowers.','Printed on thick paper.','Removed from every computer.'], 'private 和前面的 public 相對，指限制存取的班級資料夾。','I can choose that one instead and keep this picture in our private class folder.', ['與 public 的公開範圍相對。','不表示只能存花照。','資料夾不是紙張材質。','keep 表示保留，不是全部刪除。']),
q('X','Which plan follows both of Sara’s requests for the public post?', ['Show only flowers and omit the students’ names.','Show Sara’s face without her name.','Show only flowers and add Sara’s name.','Show both faces and all the names.'], '需同時滿足不露臉與不列姓名，不能只滿足一項。','Please also leave our names out of the public post.', ['同時滿足前後兩項要求。','仍公開她的臉。','違反不列姓名。','兩項都違反。']),
q('M','What is the conversation mainly about?', ['Agreeing on a suitable way to share a photo.','Learning how to grow larger flowers.','Choosing a new name for a website.','Explaining how to delete a class folder.'], '對話從是否上傳談到照片與姓名的取捨，重點是共享方式的共識。','The post will describe the garden, not the students.', ['涵蓋不同意見及最後方案。','沒有種花教學。','沒有替網站命名。','沒有刪除資料夾。'])
]),
lesson(16, 'A Fair Test Needs a Record', '區分實驗觀察、推測與紀錄的限制。',
`Nora’s science group wants to compare two paper towels. They pour ten spoonfuls of water onto a tray and use one sheet to soak it up. Then they repeat the test with the other brand.

The first towel leaves one spoonful on the tray. The second leaves three. Nora writes these numbers in a table. Her partner says, “Let’s write zero for our favorite brand. It will look better.”

Nora refuses. A useful record shows what happened, not what the group hoped would happen. She also notices that their sheets have different sizes. Perhaps the larger towel takes up more water simply because it is larger.

They decide to test equal-sized pieces next time. For now, their report includes the measured amounts and the size difference. It does not name one brand as the winner.`,
[['compare','比較','We compare two kinds of paper towels.'],['repeat','重複','Repeat the test with clean water.'],['record','紀錄','A useful record includes the real numbers.'],['refuse','拒絕','Nora refuses to change the result.'],['measured','測量所得的','Write down the measured amounts.']],
[['soak up','吸收（水分）'],['for now','目前；暫時']], [
q('D','How much water remains after the second towel is used?', ['Three spoonfuls.','One spoonful.','Ten spoonfuls.','Zero spoonfuls.'], '第二款留下三匙；一匙是第一款結果。','The first towel leaves one spoonful on the tray. The second leaves three.', ['直接對應 second leaves three。','這是第一款。','十匙是每次起始水量。','零是夥伴想捏造的數字。']),
q('D','What difference does Nora notice between the sheets?', ['Their sizes are different.','Their colors change in water.','One is made of cloth.','Both have holes in the center.'], 'Nora 注意到尺寸不同。','She also notices that their sheets have different sizes.', ['直接對應 different sizes。','未描述變色。','兩款都是紙巾。','未描述破洞。']),
q('I','Why does the group avoid naming a winning brand?', ['Sheet size may affect the result.','Both towels leave the same amount of water.','The group forgets every measurement.','The favorite brand has no name.'], '尺寸差異可能解釋吸水量，不宜僅靠本次測試判定品牌優劣。','Perhaps the larger towel takes up more water simply because it is larger.', ['把可能影響結果的其他因素納入判斷。','殘水量為一與三，並不相同。','Nora 已記下測量值。','沒有品牌無名的情節。']),
q('V','What does “record” mean in this passage?', ['Written information about the test.','A prize for the fastest student.','A piece of music for the group.','A new brand of paper towel.'], '上下文是表格與報告，record 指記下的實驗資料。','A useful record shows what happened, not what the group hoped would happen.', ['對應紀錄實際發生的事。','不是速度紀錄或獎品。','不是唱片。','不是品牌。']),
q('X','How much water does the first towel take up in this test?', ['Nine spoonfuls.','One spoonful.','Seven spoonfuls.','Eleven spoonfuls.'], '起始十匙、殘留一匙，吸走十減一等於九匙。','They pour ten spoonfuls of water onto a tray and use one sheet to soak it up.', ['10−1＝9。','一匙是殘留水。','七匙是第二款吸水量。','十一匙超過起始水量。']),
q('M','Which statement best matches Nora’s approach?', ['Report the real results and explain what limits the comparison.','Change weak results to support a favorite choice.','Ignore all measurements until every test is perfect.','Use larger pieces only for the favorite brand.'], 'Nora 同時保留實測值並交代尺寸差異，並非隱藏資料。','For now, their report includes the measured amounts and the size difference.', ['同時包含誠實紀錄與限制說明。','這是她拒絕的作法。','她仍寫報告。','下次要用同尺寸，不偏袒品牌。'])
]),
lesson(17, 'Borrow It, Bring It Back', '從公告判讀借用期限、責任與例外。',
`CLASSROOM TOOL SHELF

Our class now shares rulers, scissors, and colored pencils. You may borrow one item at a time. Write your name, the item, and the borrowing time in the blue notebook. Return the item before the last class of the same day begins.

If an item is damaged, tell Ms. Chen before returning it. Do not place it back without a note. Reporting damage does not automatically mean you must pay for it. Ms. Chen will first find out what happened.

The shelf is closed during lunch because the room is used for quiet reading. Tools needed after lunch must be borrowed earlier or after the reading period ends.

For a project lasting several days, ask Ms. Chen for permission before taking anything home. A friend cannot give you that permission. The shared tools belong to the whole class.`,
[['borrow','借入','May I borrow a ruler?'],['return','歸還','Return the scissors before class.'],['damaged','損壞的','Tell the teacher about the damaged tool.'],['permission','許可','Ask for permission before taking it home.'],['belong','屬於','These tools belong to the class.']],
[['at a time','一次'],['find out','查明；弄清楚']], [
q('D','Where must students record a borrowed item?', ['In the blue notebook.','On the classroom door.','In a private phone message.','On the item’s price tag.'], '借用者、物品與時間都登記在藍色筆記本。','Write your name, the item, and the borrowing time in the blue notebook.', ['原文 blue notebook。','不是門上。','不是私人訊息。','沒有價格標籤登記法。']),
q('D','When is an ordinary same-day loan due?', ['Before the last class begins.','At the end of the week.','After everyone goes home.','Before lunch begins.'], '期限是當日最後一節開始前，不能誤讀成最後一節結束。','Return the item before the last class of the same day begins.', ['精確保留 begins。','不是週末。','放學後已超過期限。','午餐不是一般歸還期限。']),
q('I','Why is the shelf closed at lunchtime?', ['Borrowing tools could interrupt quiet reading.','The tools are taken to another school.','Ms. Chen sells the tools at lunch.','Students must clean every tool then.'], '午餐時教室用於安靜閱讀，停止借用可減少干擾。','The shelf is closed during lunch because the room is used for quiet reading.', ['公告的明確因果支持此解釋。','沒有移到別校。','不是販售時間。','沒有要求午餐全面清潔。']),
q('V','What does “permission” mean here?', ['Approval to do something.','Money used to buy something.','A list of broken tools.','Time spent on a project.'], '要先問老師能否帶回家，因此是許可。','For a project lasting several days, ask Ms. Chen for permission before taking anything home.', ['問老師准不准帶走。','不是買工具的錢。','不是損壞清單。','不是時間長度。']),
q('X','A student wants to take scissors home for two days. What should the student do?', ['Ask Ms. Chen before taking them.','Get permission from any friend.','Write a name and take them without asking.','Wait until lunch and take them quietly.'], '多日專案帶回家須由老師同意，一般登記不能取代許可。','A friend cannot give you that permission.', ['符合前句先詢問老師的規定。','公告明確否定朋友的許可。','登記不等於批准外借。','午餐關閉，且偷偷取走不符規定。']),
q('I','What can students conclude about reporting damage?', ['The teacher will check the situation before deciding responsibility.','Every report requires immediate payment.','No damaged item ever needs to be reported.','A friend decides who pays for repairs.'], '通報不代表立刻賠償，但也不是保證免責；老師會先查明。','Reporting damage does not automatically mean you must pay for it. Ms. Chen will first find out what happened.', ['符合先查明再處理。','automatically 被否定。','必須先告知老師。','決定者不是朋友。'])
]),
lesson(18, 'Boss: The Class Fund Puzzle', '整合收據、現金紀錄與對話，找出合理解釋。',
`[Class fund record]
The class starts with $600 for its garden project. On Monday, Nina buys seeds for $180 and labels for $60. She keeps both receipts. On Tuesday, she counts $340 in the money box, but her notebook says $360 should remain.

[Messages]
Nina: We are $20 short. Did anyone borrow money?
Jay: I bought string yesterday. It cost $20. I left the receipt under the notebook, but I forgot to write it down.
Nina: I can see it now. Next time, please record the purchase immediately.
Jay: I will. Should I put another $20 in the box?
Nina: No. The string was for our project. We need to update the record, not collect the money twice.

[New rule]
Before putting a receipt in the folder, the buyer must enter the date, item, and amount in the notebook. Another student checks the entry against the receipt.`,
[['receipt','收據','Keep the receipt after buying seeds.'],['remain','剩下','How much money will remain?'],['purchase','購買；購買的物品','Record each purchase in the notebook.'],['immediately','立即','Write the amount immediately.'],['entry','一筆紀錄','Check the entry against the receipt.']],
[['write down','寫下'],['be short of','短缺；不足']], [
q('D','How much does the class have at the beginning?', ['$600.','$360.','$340.','$240.'], '起始基金是六百元。','The class starts with $600 for its garden project.', ['原文起始金額。','三百六十是未記繩子時的帳面餘額。','三百四十是盒內現金。','二百四十是種子加標籤花費。']),
q('D','Where is the string receipt?', ['Under the notebook.','Inside a seed bag.','At Jay’s home.','On the classroom wall.'], 'Jay 表示放在筆記本下面。','I left the receipt under the notebook, but I forgot to write it down.', ['精確對應 under the notebook。','不是種子袋內。','沒有留在家裡。','不是牆上。']),
q('X','How much did Nina spend on seeds and labels?', ['$240.','$180.','$60.','$260.'], '種子一百八十加標籤六十，共二百四十元。','On Monday, Nina buys seeds for $180 and labels for $60.', ['180＋60＝240。','只算種子。','只算標籤。','多算 Jay 的繩子，不是題目問的兩項。']),
q('I','Why does Nina say Jay should not add $20?', ['The string was a project expense that needs to be recorded.','The class received the string for free.','Jay already put $20 back in the box.','The garden project has been canceled.'], 'Nina 接受繩子是專案用途，所需是補登支出，不是再向 Jay 收錢。','No. The string was for our project. We need to update the record, not collect the money twice.', ['Nina 的回覆把它當作專案支出。','繩子花了二十元。','Jay 只提出詢問，尚未放回。','專案沒有取消。']),
q('D','What must the buyer do before filing a receipt?', ['Record the date, item, and amount.','Ask every student for more money.','Throw away the old notebook.','Wait until the end of the project.'], '新規定要求收據歸檔前先登記三項資訊。','Before putting a receipt in the folder, the buyer must enter the date, item, and amount in the notebook.', ['三項資訊都符合。','不是每次加收錢。','沒有丟棄帳本。','不能等專案結束。']),
q('M','What caused the class fund puzzle?', ['A real expense was missing from the written record.','Nina bought the same seeds twice.','The class started without any money.','Jay returned more money than he borrowed.'], '現金少二十元的原因是繩子已買但未登帳，不是錢被偷。','It cost $20. I left the receipt under the notebook, but I forgot to write it down.', ['已支出、未記錄兩者造成差異。','沒有重複買種子。','起始有六百元。','沒有歸還超額款項。']),
q('V','What does “entry” mean in the new rule?', ['A written record of a purchase.','The door to the garden.','A student entering a race.','The amount collected next year.'], '比對收據與 entry，指剛寫入的帳目。','Another student checks the entry against the receipt.', ['對應帳本的一筆購買紀錄。','此處不是入口。','不是報名參賽者。','不是明年的收款。']),
q('X','What should the corrected remaining balance be?', ['$340.','$360.','$380.','$320.'], '六百減一百八十、六十與二十，剩三百四十，吻合現金。','On Tuesday, she counts $340 in the money box, but her notebook says $360 should remain.', ['600−180−60−20＝340。','漏記繩子。','錯把支出加回。','把繩子扣了兩次。']),
q('I','Why does the new rule include a second student?', ['To compare the written amount with independent evidence.','To make every purchase twice as expensive.','To replace all receipts with memories.','To stop students from buying any supplies.'], '第二人用收據查帳，能發現漏登或抄錯，而不是單靠買的人回想。','Another student checks the entry against the receipt.', ['收據與帳目交叉核對。','雙人檢查不會使價格翻倍。','仍需保留收據。','規定允許買東西但要記錄。'])
]),
lesson(19, 'The Clue Card Exchange', '回收本週字詞，練習用上下文說明答案。',
`At Friday’s review club, each team receives five cards. The words are extra, sealed, private, permission, and receipt. Teams must match them with short situations, then explain their choices to another team.

One situation describes a bag that nobody has opened. Another describes a folder that only class members may see. Kim matches these with sealed and private. For a paper showing what a shop sold and how much it cost, she chooses receipt.

Her partner places permission beside a situation about an extra chair. Kim asks him to find the person who allows an action. He cannot, so they exchange the cards and check again.

The teacher awards a point only when a team explains its clue. A quick guess is not enough. Before leaving, each student writes a new situation for one word without copying the original card.`,
[['extra','額外的','We need an extra chair.'],['sealed','密封的','The bag is sealed and unopened.'],['private','非公開的','Only our class can open the private folder.'],['permission','許可','Get permission before using the camera.'],['receipt','收據','The receipt shows what I paid.']],
[['match with','與……配對'],['not enough','還不夠']], [
q('D','How many word cards does each team receive?', ['Five.','Two.','Three.','Ten.'], '首段明確寫五張。','At Friday’s review club, each team receives five cards.', ['原文 five cards。','兩人不等於兩張卡。','三是文中先解釋的情境數，不是總卡數。','沒有十張。']),
q('D','Which word matches an unopened bag?', ['Sealed.','Private.','Receipt.','Permission.'], '未拆封的袋子對應 sealed。','Kim matches these with sealed and private.', ['前兩個情境依序是袋子未開、資料夾限制。','private 對應班級資料夾。','receipt 是購物證明。','permission 是許可。']),
q('I','Why does Kim ask who allows an action?', ['She is looking for a clue that supports “permission.”','She wants someone to open every private folder.','She needs a shop to print more receipts.','She thinks every card must contain a name.'], 'permission 需要准許行為的語境；額外椅子的情境沒有這種線索。','Kim asks him to find the person who allows an action.', ['用定義反查情境線索。','不是要求開資料夾。','沒有請商店列印。','不是所有單字都需人名。']),
q('V','What does “receipt” mean in the passage?', ['A paper that records a shop purchase.','A card inviting someone to a club.','A note giving permission to leave.','A label showing a student’s name.'], '文中用售出品項與價格描述 receipt。','For a paper showing what a shop sold and how much it cost, she chooses receipt.', ['原文同時說明品項與價格。','不是邀請函。','不是准假單。','不是姓名標籤。']),
q('X','Which team earns a point under the teacher’s rule?', ['A team that gives an answer and explains the matching clue.','A team that guesses correctly but gives no explanation.','A team that finishes first with no matches.','A team that copies another team’s cards without checking.'], '得分條件是能解釋支持配對的線索，不是速度或幸運猜中。','The teacher awards a point only when a team explains its clue.', ['滿足解釋線索的條件。','缺少必要解釋。','快不代表有配對與解釋。','抄寫不等於理解線索。']),
q('M','What skill does the final task check?', ['Using a word in a different meaningful situation.','Remembering the exact shape of a card.','Copying the teacher’s handwriting.','Finding the shortest word on the list.'], '自己寫新情境且不能照抄，檢查是否能遷移使用單字。','Before leaving, each student writes a new situation for one word without copying the original card.', ['新情境需要理解詞義。','沒有要求記卡片形狀。','禁止直接照抄。','不是比字長。'])
]),
lesson(20, 'The Ten-Minute Gap', '讀懂時間順序，判斷短空檔適合完成的任務。',
`After school, Eva has ten minutes before her bus leaves. She usually spends them looking through short videos. By evening, she often feels that she has no time for English.

On Monday, her teacher gives the class a small experiment: choose one short task for a waiting period. Eva puts five word cards in her bag. At the bus stop, she looks at each English word, recalls its meaning, and checks the back. She keeps the difficult cards at the front for another try.

She does not try to finish all her homework there. A noisy bus stop is not a good place for every task. At home, she uses her desk for longer reading. After a week, Eva still has busy evenings, but she no longer thinks every waiting minute must be wasted.`,
[['gap','空檔；間隔','I have a short gap before the next class.'],['recall','回想起','Try to recall the meaning before checking.'],['difficult','困難的','Keep the difficult cards for another try.'],['noisy','吵雜的','The bus stop is noisy after school.'],['waste','浪費','I do not want to waste the waiting time.']],
[['look through','瀏覽'],['at the front','在前面']], [
q('D','How long does Eva wait for her bus?', ['Ten minutes.','Five minutes.','An hour.','A whole evening.'], '放學後到公車離開有十分鐘。','After school, Eva has ten minutes before her bus leaves.', ['原文 ten minutes。','五是字卡張數。','沒有等一小時。','晚間是另一個學習時段。']),
q('D','What does Eva do before checking a card’s back?', ['She tries to remember the word’s meaning.','She plays a short video.','She writes all her homework.','She asks the driver for an answer.'], '她先主動回想詞義，再看背面核對。','At the bus stop, she looks at each English word, recalls its meaning, and checks the back.', ['保留 recalls 在 checks 之前。','這是以前常做的事。','她不在站牌完成全部功課。','沒有詢問司機。']),
q('I','Why does Eva do longer reading at home?', ['Her desk is better suited to a task needing more attention.','Reading is forbidden on all buses.','Her teacher collects every card at the bus stop.','She has no books at school.'], '她指出站牌很吵並把長閱讀留到書桌，支持環境與任務配合的推論。','A noisy bus stop is not a good place for every task. At home, she uses her desk for longer reading.', ['兩句對比任務與環境。','文中沒有禁止閱讀的規定。','沒有老師收卡片。','未提沒有書。']),
q('V','What does “recalls” mean here?', ['Brings back to mind.','Says in a louder voice.','Writes in a different color.','Puts inside a bag.'], '先看英文、回想意思、再翻卡，recalls 是從記憶提取。','she looks at each English word, recalls its meaning, and checks the back.', ['符合先回想再確認的流程。','不是音量。','不是換顏色寫。','不是收進包裡。']),
q('X','Which plan best follows Eva’s method?', ['Use waiting time for cards and quiet desk time for longer reading.','Do every task at the bus stop to keep evenings completely free.','Check each answer before trying to remember it.','Remove every difficult card after the first mistake.'], '短任務利用空檔，長任務選安靜地點；難字則保留重試。','She keeps the difficult cards at the front for another try.', ['整合不同時段與難字重試安排。','她仍有忙碌的晚上。','顛倒回想與看答案順序。','她把難字留在前面，不移除。']),
q('M','What is the main idea?', ['A small gap can be useful when the task fits it.','All homework becomes easy after one week.','Watching videos always improves reading.','Students should stop using buses.'], '文章沒有保證所有作業變簡單，而是讓適合的小任務利用零碎時間。','she no longer thinks every waiting minute must be wasted.', ['涵蓋空檔與任務匹配。','她晚間仍忙。','影片是舊習慣，非改進方法。','沒有建議停搭公車。'])
]),
lesson(21, 'Dinner Before the Deadline', '利用開放時間與準備時間倒推行動。',
`Sam promises to return a neighbor’s cake pan before seven tonight. His family also plans to eat dinner at six thirty. He thinks there is plenty of time and begins a computer game at five forty.

At six ten, his mother asks whether the pan is clean. Sam checks the kitchen and finds it beside the sink, still sticky. Washing and drying it takes fifteen minutes. The neighbor lives a ten-minute walk away.

Sam pauses the game, cleans the pan, and leaves at six twenty-five. He reaches the neighbor’s door at six thirty-five. The pan is returned on time, but Sam misses the beginning of dinner.

After eating, he changes tomorrow’s task list. Instead of writing only the final deadline, he adds the time needed to get ready and travel. He also leaves a little room for unexpected delays.`,
[['promise','承諾','Sam promises to return the pan.'],['deadline','截止時間','The deadline is seven tonight.'],['sticky','黏黏的','The pan is sticky after baking.'],['pause','暫停','Pause the game before cleaning.'],['delay','延誤','Leave some time for a delay.']],
[['on time','準時'],['get ready','準備好']], [
q('D','By what time does Sam promise to return the pan?', ['Before seven.','Before five forty.','Before six ten.','Before six thirty.'], '歸還承諾是七點前，不是開飯時間。','Sam promises to return a neighbor’s cake pan before seven tonight.', ['直接對應 before seven。','這是開始玩遊戲時間。','這是母親詢問時間。','這是吃飯時間。']),
q('D','Why can’t Sam leave with the pan immediately at six ten?', ['It still needs washing and drying.','The neighbor has moved away.','The pan is locked in a classroom.','He must buy a new cake first.'], '烤盤還黏黏的，需十五分鐘洗淨擦乾。','Washing and drying it takes fifteen minutes.', ['前句說 still sticky，後句給清潔時間。','鄰居仍住十分鐘路程外。','烤盤在水槽旁。','沒有購蛋糕的要求。']),
q('X','When does Sam reach the neighbor?', ['At six thirty-five.','At six twenty-five.','At six forty-five.','At seven ten.'], '六點二十五出發，走十分鐘，六點三十五到。','He reaches the neighbor’s door at six thirty-five.', ['25＋10＝35，且原文有寫。','這是離家時間。','多算十分鐘。','沒有這個到達時間。']),
q('V','What does “deadline” mean?', ['The latest time by which a task must be finished.','The place where a task begins.','The length of a computer game.','The number of people eating dinner.'], 'deadline 指任務必須完成的最後期限。','Instead of writing only the final deadline, he adds the time needed to get ready and travel.', ['與準備時間、交通時間並列的最終期限。','不是地點。','不是遊戲長度。','不是用餐人数。']),
q('I','Which statement about Sam’s evening is supported?', ['He keeps his return promise but starts dinner late.','He returns the pan after seven.','He eats before leaving with the pan.','He stops planning because delays cannot be avoided.'], '六點三十五歸還早於七點，但晚於六點半開飯。','The pan is returned on time, but Sam misses the beginning of dinner.', ['兩項時間對照都符合。','七點前已歸還。','回來之後才吃。','他調整了明日清單。']),
q('X','If Sam wants to be back by six thirty, when must he start the fifteen-minute cleaning at the latest? Assume ten minutes each way and no other delays.', ['At five fifty-five.','At six five.','At six fifteen.','At six twenty-five.'], '需要清洗15分＋去10分＋回10分＝35分，18:30倒推是17:55。','Washing and drying it takes fifteen minutes. The neighbor lives a ten-minute walk away.', ['18:30−35分＝17:55。','漏算回程十分鐘。','只留清潔時間。','只剩五分鐘。'])
]),
lesson(22, 'Which Meeting Is the Final One?', '辨識訊息更新後的時間、地点與人數。',
`[Group chat: Poster team]
Monday, 4:10 p.m.
Tina: Let’s meet in the library at four tomorrow. We can finish our poster before the school closes at five.
Rex: I have music practice until four fifteen. Can we start at four twenty?
Tina: That should work. We need about thirty minutes.

Monday, 7:00 p.m.
Tina: Update: the library has a meeting tomorrow afternoon. We’ll use Room 203 instead. The starting time stays the same.
Rex: Got it. Four twenty in Room 203. I’ll bring the photos.
Lulu: I can’t arrive before four forty. Should you wait for me?
Tina: No. We’ll start with the photos. Please bring the title letters when you arrive.
Lulu: Okay. I’ll read this latest message again before leaving home.
Rex: Good idea. The first plan is still visible, but it is no longer the one we will follow.`,
[['update','更新；最新消息','Read the update before leaving.'],['arrive','到達','Lulu will arrive at four forty.'],['latest','最新的','Check the latest message.'],['visible','看得見的','The old plan is still visible.'],['follow','遵循','Which plan should we follow?']],
[['stay the same','保持不變'],['no longer','不再']], [
q('D','Where will the team finally meet?', ['In Room 203.','In the library.','In the music room.','At Lulu’s home.'], '七點更新改到203教室。','We’ll use Room 203 instead.', ['最新更新指定此地。','這是初版地點，已改。','Rex 練音樂不代表在音樂室開會。','沒有在家開會。']),
q('D','What will Rex bring?', ['The photos.','The title letters.','Musical instruments for everyone.','The library keys.'], 'Rex 說他會帶照片。','I’ll bring the photos.', ['直接對應 photos。','字母是 Lulu 帶。','沒有帶全組樂器。','沒有鑰匙。']),
q('X','What is the shortest possible gap between the meeting’s start and Lulu’s arrival?', ['Twenty minutes.','Ten minutes.','Thirty minutes.','Forty minutes.'], '16:20開始，Lulu最早16:40到，最短差20分。','Lulu: I can’t arrive before four forty.', ['40−20＝20，這是最早抵達的時差。','16:30仍早於她能抵達的時間。','可能較晚抵達，但不是最短時差。','40是分鐘刻度，不是最短時差。']),
q('V','What does “latest” mean here?', ['Most recent.','Longest in length.','Most difficult.','First written.'], 'latest message 指更新之後最近一則有效訊息。','I’ll read this latest message again before leaving home.', ['與已過時的初版相對。','不是字數最長。','不是難度最高。','不是最早訊息。']),
q('I','Why won’t the team wait for Lulu?', ['They can work on the photos before she brings the letters.','They do not need a title anymore.','She is bringing the wrong materials.','The meeting has already been canceled.'], 'Tina 把照片先做、字母後帶，讓分工配合不同抵達時間。','We’ll start with the photos. Please bring the title letters when you arrive.', ['分段工作使會議能先開始。','仍需標題字母。','她帶的是指定材料。','會議只是改地點。']),
q('X','Which summary contains the final plan?', ['Start Tuesday at 4:20 in Room 203, with Lulu joining later.','Start Monday at 7:00 in the library with everyone.','Start Tuesday at 4:00 in Room 203 and wait for Lulu.','Start Tuesday at 4:40 in the library with the title letters.'], '整合星期一說tomorrow、時間調整16:20、換教室及不等Lulu四個條件。','The first plan is still visible, but it is no longer the one we will follow.', ['四項條件都依最新對話。','七點是更新訊息時間。','四點是原時間，且不等Lulu。','地點及開始時間都錯。'])
]),
lesson(23, 'The Bell and the Puzzle', '從實驗紀錄理解中斷、比較與證據限制。',
`Mr. Wu gives two groups the same kind of word puzzle. Group A works in a quiet room. Group B works in another room, where a bell rings every two minutes. When it rings, those students must stop and write a number before continuing.

Group A finishes after eight minutes. Group B takes eleven. Several students in Group B say they need time to remember where they stopped. Mr. Wu asks whether the bell is the only possible reason for the difference.

Judy points out that the groups contain different students. Some may already be better at word puzzles. The class plans another test with fresh puzzles of similar difficulty. Each group will try the other room.

Their first results suggest that interruptions may matter, but they do not prove that every short break makes every student slower.`,
[['puzzle','謎題','This word puzzle has ten clues.'],['continue','繼續','Continue after writing the number.'],['similar','相似的','Use puzzles of similar difficulty.'],['interruption','中斷','The bell causes an interruption.'],['prove','證明','One test cannot prove every claim.']],
[['point out','指出'],['every two minutes','每兩分鐘']], [
q('D','What must Group B do when the bell rings?', ['Stop and write a number.','Leave the building.','Exchange every answer.','Begin the whole puzzle again.'], '鈴響時停下並寫數字，之後繼續。','When it rings, those students must stop and write a number before continuing.', ['符合指定動作。','沒有離開大樓。','沒有交換答案。','不是全部重來。']),
q('X','How much longer does Group B take?', ['Three minutes.','Two minutes.','Eight minutes.','Nineteen minutes.'], '十一分鐘減八分鐘，差三分鐘。','Group A finishes after eight minutes. Group B takes eleven.', ['11−8＝3。','兩分鐘是鈴聲間隔。','八分鐘是A總用時。','十九是兩組時間相加。']),
q('I','Why does Judy mention different students?', ['Their puzzle skills might also explain the time difference.','She thinks the puzzles contain no words.','She knows the bell rang in both rooms.','She wants to remove all measurements.'], '不同學生原本的解題能力可能不同，是另一個可能原因。','Some may already be better at word puzzles.', ['考慮學生能力這個因素。','題目確實是文字謎題。','A是安靜房間。','沒有要刪除實測。']),
q('V','What does “interruptions” refer to in this test?', ['Stops that break up the students’ work.','Prizes for finishing early.','Words that nobody can read.','Changes in the color of the paper.'], '鈴聲要求暫停作業，interruptions就是這些中斷。','Several students in Group B say they need time to remember where they stopped.', ['與停下後要重新想起進度相符。','沒有獎品。','不是難字。','沒有紙色變更。']),
q('X','What changes in the second test while the difficulty should stay similar?', ['The groups try the other room with fresh puzzles.','Group A gets much easier puzzles in its old room.','Both groups work on the completed first puzzle.','Only the fastest student takes part.'], '換房間並用相近難度新題，減少組別與記住舊答案對比較的影響。','Each group will try the other room.', ['整合前句的新題、相似難度與此句換房。','難度不同不符合計畫。','計畫用fresh puzzles。','仍是兩組，不是單人。']),
q('M','Which conclusion is most careful?', ['Interruptions may have affected this test, but more evidence is needed.','Every short break makes every student slower.','Group B can never solve a puzzle quickly.','Different students always finish at the same speed.'], '保留may，且承認目前不能推及所有人與所有休息。','Their first results suggest that interruptions may matter, but they do not prove that every short break makes every student slower.', ['符合限制性結論。','正是原文否定的過度推論。','一次結果不能推論永遠。','文章提出能力可能不同。'])
]),
lesson(24, 'Thirty Minutes in the Maker Room', '讀懂預約、截止時間與最後使用時段。',
`MAKER ROOM BOOKING

The maker room opens from 3:00 to 5:00 p.m. on weekdays. Each team may book one thirty-minute slot per day. Available starting times are 3:00, 3:30, 4:00, and 4:30. Cleaning is included in your slot, so leave the tables ready for the next team.

Book by noon on the day before your visit. For a Monday visit, book by noon on Friday. A booking is complete only after you receive a confirmation message. Writing your name on a waiting list does not reserve a place.

If you arrive more than ten minutes late, the room manager may give your slot to a waiting team. Arriving late never moves the ending time. Bring your design on paper because the room computers are not available for drawing plans. You may use them only to control the machines.`,
[['book','預約','Book a slot before noon.'],['slot','時段','Each slot lasts thirty minutes.'],['confirmation','確認','Wait for a confirmation message.'],['reserve','保留；預訂','A waiting list does not reserve a place.'],['available','可使用的','The computers are available for machine control.']],
[['by noon','中午以前'],['be included in','包含在……之內']], [
q('D','How long is one team’s slot?', ['Thirty minutes, including cleaning.','Thirty minutes, with extra cleaning time afterward.','Ten minutes.','Two hours.'], '每組三十分鐘，清潔已包含在內。','Cleaning is included in your slot, so leave the tables ready for the next team.', ['連同前句每slot三十分鐘。','不能额外占用下一組時間。','十分钟是遲到門檻。','兩小時是全日開放長度。']),
q('D','What confirms a successful booking?', ['Receiving a confirmation message.','Joining the waiting list.','Drawing a design at home.','Arriving at the room early.'], '收到確認訊息後預約才成立。','A booking is complete only after you receive a confirmation message.', ['only after 明確列必要條件。','公告說候補不保留名額。','備好圖紙不等於訂成功。','早到不是預約確認。']),
q('X','When must a team book a Monday visit?', ['By noon on Friday.','By noon on Sunday.','At 3:00 p.m. on Monday.','After receiving a Monday reminder.'], '星期一使用的特別規則是週五中午前，不能套用一般前一天。','For a Monday visit, book by noon on Friday.', ['符合Monday的例外。','週日不符合特別規定。','到現場才訂已過截止。','沒有此提醒流程。']),
q('V','What does “slot” mean in the notice?', ['A period set aside for a team.','A narrow hole in a machine.','A list of drawing materials.','A message sent after cleaning.'], '與開始時間及三十分鐘連用，slot 指預約時段。','Each team may book one thirty-minute slot per day.', ['上下文以時間描述。','slot有孔槽義，但此處不是。','不是物品清單。','不是訊息。']),
q('X','A team keeps its 4:00 slot but arrives at 4:08. When must it finish cleaning and leave?', ['By 4:30.','By 4:38.','By 4:40.','By 5:00.'], '遲到不順延結束時間，4:00開始的30分時段仍4:30結束。','Arriving late never moves the ending time.', ['4:00＋30分＝4:30。','錯從抵達才開始計30分。','把10分門檻當成延長。','5點是整間關門時間。']),
q('I','Which action is allowed by the notice?', ['Bring a paper design and use a room computer to control a machine.','Use a room computer to draw the plan from the beginning.','Book two slots for the same team on one day.','Keep working after a slot ends if the team arrived late.'], '電腦限機器控制，圖稿需事先用紙帶來；其餘均違規。','You may use them only to control the machines.', ['符合紙圖與機器控制用途。','公告不開放電腦繪圖。','每組每天僅一時段。','遲到不延長時間。'])
]),
lesson(25, 'Boss: The Library Window', '整合行程表、任務長度、截止時間與緩衝。',
`[Saturday plan]
Noah wants to finish a history poster and return library books. The library closes at 4:30 p.m. He needs ten minutes to walk there, five minutes to return the books, and ten minutes to walk home.

[At 3:00 p.m.]
His poster still needs forty minutes of work. His friend suggests doing it first and then watching a twenty-minute video together. Noah also wants ten spare minutes before the library closes in case the return desk is busy.

[Two choices]
Plan A: Poster, video, then library.
Plan B: Poster, library, then video.

Noah draws a timeline. Under Plan A, he would reach the library at 4:10 and finish at 4:15 if nothing goes wrong. Under Plan B, he would finish returning books at 3:55. Both plans fit the closing time, but only one gives him more than half an hour after the planned return to handle trouble.`,
[['spare','多餘可用的；備用的','Keep ten spare minutes in your plan.'],['suggest','建議','His friend suggests watching a video.'],['timeline','時間軸','Draw a timeline before choosing.'],['handle','處理','Leave enough time to handle trouble.'],['trouble','麻煩；問題','The extra time helps if there is trouble.']],
[['in case','以防'],['go wrong','出問題']], [
q('D','When does the library close?', ['At 4:30 p.m.','At 3:00 p.m.','At 3:55 p.m.','At 4:10 p.m.'], '公告關門時間是4:30。','The library closes at 4:30 p.m.', ['直接對應關門時間。','這是規劃起點。','這是B方案還完書時間。','這是A方案到達時間。']),
q('D','How much work does the poster still need?', ['Forty minutes.','Ten minutes.','Twenty minutes.','Five minutes.'], '海報尚需四十分鐘。','His poster still needs forty minutes of work.', ['原文 forty。','這是單程步行或最低預備時間。','這是影片長度。','這是還書服務時間。']),
q('X','When does the poster finish if Noah starts at 3:00?', ['At 3:40.','At 3:20.','At 3:50.','At 4:00.'], '三點加四十分鐘是3:40。','His poster still needs forty minutes of work.', ['時間相加正確。','只算二十分鐘。','多加步行時間。','多加影片時間。']),
q('D','What comes immediately after the poster in Plan B?', ['The library visit.','The video.','A new history class.','Another forty minutes of poster work.'], 'B順序是海報、圖書館、影片。','Plan B: Poster, library, then video.', ['順序第二項library。','影片是最後。','沒有新歷史課。','海報已完成，不重做。']),
q('X','How many minutes remain between the planned return completion and closing in Plan A?', ['Fifteen minutes.','Ten minutes.','Twenty minutes.','Thirty-five minutes.'], 'A4:15還完，距4:30關門十五分鐘。','Under Plan A, he would reach the library at 4:10 and finish at 4:15 if nothing goes wrong.', ['4:30−4:15＝15分。','十是最低希望預備，不是實際剩餘。','二十是影片長度。','三十五是B餘裕。']),
q('I','Why does Noah keep spare time?', ['The return desk may take longer than expected.','He expects the library to close at 3:00.','The walk home always takes an hour.','He needs to watch the video at the return desk.'], '備用時間是因應還書櫃台忙碌。','in case the return desk is busy.', ['支持等待可能增加的推論。','已知4:30關門。','回程十分鐘。','影片不是櫃台任務。']),
q('V','What does “handle” mean in the last sentence?', ['Deal with.','Hold by a small part.','Write down a title for.','Walk past without noticing.'], 'handle trouble 是處理突發狀況，不是握把的字面意思。','to handle trouble.', ['符合問題處理語境。','此處trouble不是實物。','不是寫標題。','不是忽略問題。']),
q('X','Which plan provides more than thirty minutes after the planned book return and before closing?', ['Plan B only.','Plan A only.','Both plans.','Neither plan.'], 'B3:55至4:30有35分，A只有15分，所以僅B。','Under Plan B, he would finish returning books at 3:55.', ['B35分超過30分。','A只有15分。','不能把最低10分當作30分。','B確實符合。']),
q('I','What is the best reason to prefer Plan B?', ['It does the deadline-bound errand before an activity that can wait.','It makes the video shorter.','It removes the need to walk home.','It guarantees that no unexpected event can happen.'], '順序調整讓有關門限制的還書先完成，影片可後做；不是保證零風險。','Plan B: Poster, library, then video.', ['把有期限事項排在較彈性的活動之前。','影片仍二十分鐘。','仍須步行回家。','增加緩衝不能保證絕無意外。'])
]),
lesson(26, 'Five Words, One Better Plan', '透過新情境複習時間字詞，區分完成與熟悉。',
`Sophie makes a review sheet with five words: recall, deadline, latest, pause, and delay. She writes a short school story and leaves spaces where the words should go. Then she asks her brother to try it.

The story describes a student who checks an old meeting message, arrives at the wrong room, and loses ten minutes. Sophie’s brother chooses latest for the message the student should have checked. He uses delay for the lost time.

At another space, he first puts deadline after “Please stop the recording for a moment.” Sophie asks him to explain his choice. He changes it to pause and writes a reason beside the sentence.

They do not mark a word as learned just because it looks familiar. The next morning, they cover the answer list and try to recall all five words from new clues.`,
[['recall','回想起','Can you recall the word without looking?'],['deadline','截止時間','Write the deadline on the task list.'],['latest','最新的','The latest message changes the room.'],['pause','暫停','Pause the recording for a moment.'],['delay','延誤','A room change caused a short delay.']],
[['for a moment','片刻'],['look familiar','看起來熟悉']], [
q('D','Who tries Sophie’s review sheet?', ['Her brother.','Her bus driver.','The room manager.','All the neighbors.'], 'Sophie 請她的兄弟試作。','Then she asks her brother to try it.', ['原文 her brother。','沒有司機試作。','沒有管理員。','沒有所有鄰居。']),
q('D','Which word describes the time lost after going to the wrong room?', ['Delay.','Deadline.','Latest.','Recall.'], '失去的十分鐘對應 delay。','He uses delay for the lost time.', ['直接對應延誤。','deadline是最後期限。','latest描述最新。','recall是回想。']),
q('I','Why does Sophie ask for an explanation?', ['To check whether the chosen word fits the situation.','To make every answer longer than the story.','To stop her brother from changing any answer.','To find out who recorded the message.'], '說明理由讓他發現deadline不適合「暫停」，促成修正。','He changes it to pause and writes a reason beside the sentence.', ['解釋後能檢查詞義與情境。','不是比字數。','她接受修正。','不是追查錄音者。']),
q('V','What does “familiar” mean in the passage?', ['Recognizable from seeing it before.','Impossible to pronounce.','Useful only to a family member.','Written with no mistakes.'], 'looks familiar 指看過覺得眼熟，不等於能自行回想。','They do not mark a word as learned just because it looks familiar.', ['與後面主動回想做對比。','不是無法發音。','不是family的意思。','眼熟不等於拼字正確。']),
q('X','Which action checks memory more directly than looking at the answers?', ['Covering the list and answering new clues the next morning.','Reading the same answer aloud while looking at it.','Copying the answer list onto another page.','Counting how many letters each printed answer has.'], '遮答案隔天用新線索提取，才檢查是否能從記憶回想。','The next morning, they cover the answer list and try to recall all five words from new clues.', ['沒有答案提示且換新情境。','看得到答案不需回想。','抄寫可不理解。','數字母不是詞義回憶。']),
q('M','What is the main idea of the passage?', ['Explaining and recalling words helps check real understanding.','An old message is always more useful than a new one.','Changing an answer means the whole exercise has failed.','A word is learned as soon as it looks familiar.'], '從理由修正、遮答案到新情境，核心是確認理解而非只眼熟。','They do not mark a word as learned just because it looks familiar.', ['涵蓋兩種檢查方法。','錯教室是未看最新訊息造成。','修正是學習一部分。','文中明確否定。'])
]),
lesson(27, 'One Bowl, Twelve Cups', '分辨容器容量、供應份量與公平分配。',
`At the class food fair, Mina brings a large bowl of fruit salad. Twelve students want to try it. A sign beside the bowl says “One cup for each visitor.” Mina expects the salad to fill twelve small cups.

The first visitor picks up a large drinking cup and prepares to fill it. Mina stops him to explain the intended portion. The sign does not explain which cup to use, and several kinds are sitting on the table.

She places twelve matching small cups beside the bowl and adds a drawing of one to the sign. A classmate moves the large cups to the water table.

Now each visitor gets a similar portion. Mina learns that a rule can sound clear while leaving an important detail unstated. Next time, she will show the serving cup before the fair begins.`,
[['visitor','訪客','Each visitor gets one small cup.'],['expect','預期','We expect twelve visitors.'],['matching','相同款式的；相配的','Use matching cups for equal servings.'],['portion','一份的量','Each portion fits in a small cup.'],['detail','細節','The size of the cup is an important detail.']],
[['fill to the top','裝到滿'],['beside the bowl','在碗旁邊']], [
q('D','How many students want to try the fruit salad?', ['Twelve.','One.','Six.','Twenty.'], '有十二位學生想試吃。','Twelve students want to try it.', ['直接對應 twelve。','一是每位限量杯數。','沒有六人。','沒有二十人。']),
q('D','What is missing from the first sign?', ['Which size or kind of cup to use.','The name of the school principal.','The time of the next water break.','A list of all twelve visitors.'], '公告寫一杯，卻未指定是哪一種杯子。','The sign does not explain which cup to use, and several kinds are sitting on the table.', ['文中直接指出問題。','校長姓名與規則無關。','不是休息時間。','不需列名才知道份量。']),
q('I','Why does the classmate move the large cups?', ['To make it easier to choose the intended serving cup.','To make the fruit bowl larger.','To stop everyone from drinking water.','To count how many students are absent.'], '大杯移到水桌可減少再拿錯的可能，不是加大食物。','A classmate moves the large cups to the water table.', ['結合前句小杯集中，降低混淆。','杯子搬動不改變碗大小。','水桌仍有杯子。','沒有點名。']),
q('V','What does “portion” mean here?', ['An amount of food served to one person.','The name written on a bowl.','A kind of classroom table.','The time needed to make a sign.'], '每位得到類似的portion，指個人的分配份量。','Now each visitor gets a similar portion.', ['食物分配情境支持份量。','不是碗上名字。','不是桌子種類。','不是製牌時間。']),
q('X','Which pair of changes makes the rule easier to follow?', ['Matching small cups and a drawing on the sign.','A larger bowl and a longer visitor list.','A new fruit name and no cups on the table.','Different cups and no written rule.'], '同款小杯加圖示，同時改善物品選擇和文字規則。','She places twelve matching small cups beside the bowl and adds a drawing of one to the sign.', ['兩個改變都出自原文。','沒有換碗或加名單。','仍需杯子，沒有改水果名。','這會保留原先問題。']),
q('M','What does Mina learn?', ['Instructions need to state important details, not just sound simple.','Every visitor deliberately breaks rules.','Bigger cups always give fairer servings.','A drawing is useful only when no words are used.'], '原規則看似簡單，卻漏掉關鍵杯型，需要補足具體資訊。','Mina learns that a rule can sound clear while leaving an important detail unstated.', ['對應作者明確歸納。','第一人可能只是誤解，不能推斷故意。','杯型不同可能分配不均。','本例圖與字一起使用。'])
]),
lesson(28, 'The Bigger Bag Is Not the Better Deal', '比較總價、單價與真正需求。',
`Yuri is buying apples for a small family picnic. She needs six apples, one for each person. At the shop, a six-apple bag costs $90. A larger bag holds ten apples and costs $160. All the apples are the same size and kind.

A bright sign above the larger bags says “Family Pack.” Yuri first reaches for one because a bigger package often looks like a better deal. Then she checks the price per apple. In the small bag, each apple costs $15. In the large bag, each costs $16.

Her father asks which bag fits their plan. Yuri chooses the small one. It costs less per apple and provides exactly the number they need. She keeps the $70 difference for another purchase. A package name can catch the eye, she thinks, but it cannot do the calculation for you.`,
[['cost','花費；價格為','The small bag costs ninety dollars.'],['package','包裝；一包','Read the number on the package.'],['provide','提供','Six apples provide one for each person.'],['exactly','恰好；精確地','We need exactly six apples.'],['calculation','計算','Check the calculation before paying.']],
[['per apple','每顆蘋果'],['catch the eye','吸引目光']], [
q('D','How many apples does the picnic need?', ['Six.','Ten.','Fifteen.','Sixteen.'], '六人每人一顆，共六顆。','She needs six apples, one for each person.', ['原文 six apples。','十是大袋顆數。','十五是小袋單價。','十六是大袋單價。']),
q('D','What is the price of the larger bag?', ['$160.','$90.','$70.','$16.'], '大袋十顆總價一百六十元。','A larger bag holds ten apples and costs $160.', ['直接對應總價。','九十是小袋。','七十是兩袋價差。','十六是大袋單顆價。']),
q('I','Why does the family-pack sign first attract Yuri?', ['She associates a bigger package with better value.','It guarantees that every apple is larger.','It says the apples are free.','She needs apples for ten people.'], '她直覺把大包裝和划算連結，後來才核對。','a bigger package often looks like a better deal.', ['符合她起初的判斷。','題文明說大小相同。','沒有免費。','她只需六人份。']),
q('V','What does “exactly” mean in this passage?', ['No more and no less than needed.','Almost enough but a little short.','Much more than everyone can use.','Different every time it is counted.'], '六顆剛好供六人，數量不多不少。','It costs less per apple and provides exactly the number they need.', ['與實際需求完全相同。','不是不足。','不是過量。','不是變動。']),
q('X','Which comparison is correct?', ['The small bag is $1 cheaper per apple.','The large bag is $1 cheaper per apple.','Both bags have the same price per apple.','The small bag is $70 cheaper per apple.'], '大袋16元、小袋15元，單顆差1元；70是整袋價差。','In the small bag, each apple costs $15. In the large bag, each costs $16.', ['16−15＝1，小袋較便宜。','方向顛倒。','單價不同。','混淆總價與單價。']),
q('M','Which advice best matches the story?', ['Compare unit prices and needed quantities before choosing.','Buy the package with the brightest sign.','Always buy more food than a plan requires.','Judge prices only by package names.'], 'Yuri 同時計算單價並檢查需要顆數，兩者都支持小袋。','A package name can catch the eye, she thinks, but it cannot do the calculation for you.', ['涵蓋價格計算與需求。','亮眼不代表便宜。','故事不是鼓勵過量。','名稱不能取代計算。'])
]),
lesson(29, 'Lunch for Three Different Plans', '整合對話中的個人條件與共用訂單。',
`[Lunch chat]
Ella: We have an art practice at noon. Should I order three lunches from Green Corner?
Max: Yes, but I don’t eat meat. Please choose the vegetable sandwich for me.
June: I can eat either sandwich. I have a meeting at twelve thirty, so I need mine early.
Ella: The shop delivers only at twelve twenty. We usually spend twenty minutes eating. Would you like to collect yours on the way here?
June: I can pass the shop at eleven forty-five. Could I pick up all three instead?
Max: That would help. What about drinks?
Ella: We all have water bottles, so let’s order sandwiches only.
June: Please send me the order number after the shop confirms it. I’ll check the names on the bags before leaving.
Ella: Done. Two cheese sandwiches and one vegetable sandwich, with no drinks.`,
[['either','兩者任一','June can eat either sandwich.'],['deliver','外送；送達','The shop can deliver at twelve twenty.'],['confirm','確認','Wait until the shop confirms the order.'],['collect','領取','June will collect the lunches.'],['order','訂購；訂單','Check the order number on the bags.']],
[['on the way','在途中'],['pick up','取貨；領取']], [
q('D','Which lunch does Max ask for?', ['A vegetable sandwich.','A cheese sandwich.','A meat pie.','A bowl of soup.'], 'Max 不吃肉並指定蔬菜三明治。','Please choose the vegetable sandwich for me.', ['直接指定vegetable sandwich。','起初Max沒有選cheese。','不符合不吃肉。','沒有湯的選項。']),
q('D','Why do they order no drinks?', ['They already have water bottles.','The shop sells only hot drinks.','June cannot carry any bags.','Drinks would arrive at a different school.'], '三人都有水瓶，因此只訂餐點。','We all have water bottles, so let’s order sandwiches only.', ['so說明原因。','未提飲料種類。','她將取三袋。','沒有另一所學校。']),
q('I','What problem does June’s pickup plan solve?', ['It gives her lunch before the shop’s delivery time.','It makes her meeting start later.','It changes Max’s food preference.','It removes the need to check the order.'], '外送12:20，June12:30開會來不及以平常速度吃完；提前領餐可留足時間。','The shop delivers only at twelve twenty.', ['和11:45取餐對照可更早拿到。','會議未改時間。','Max仍要蔬菜三明治。','她仍要檢查袋上名稱。']),
q('V','What does “either” mean in June’s first message?', ['One or the other of the two sandwiches.','Both sandwiches must be eaten together.','None of the sandwiches.','Only the vegetable sandwich.'], 'either在此表示兩款任一都可以。','I can eat either sandwich.', ['表示兩種選擇都能接受。','不是要求兩份一起吃。','不是否定兩者。','不是限定蔬菜款。']),
q('X','If June starts eating at 12:20 and takes the usual twenty minutes, when does she finish?', ['At 12:40, after her meeting starts.','At 12:30, exactly when her meeting starts.','At 12:25, before her meeting starts.','At 11:45, when she passes the shop.'], '12:20加20分是12:40，比會議開始晚10分。','We usually spend twenty minutes eating.', ['同時整合用餐時間與會議時間。','只給十分鐘用餐。','只給五分鐘。','11:45是提早取餐時間。']),
q('X','Which order should June collect?', ['Two cheese sandwiches and one vegetable sandwich, without drinks.','Three vegetable sandwiches with three drinks.','Two vegetable sandwiches and one cheese sandwich, without drinks.','One cheese sandwich with two drinks.'], '最後確認訊息給出品項、份數及不含飲料。','Two cheese sandwiches and one vegetable sandwich, with no drinks.', ['三項都符合最後確認。','三明治品項與飲料都錯。','兩款份數對調。','少了兩份餐，且加了飲料。'])
]),
lesson(30, 'Same Juice, Different Labels', '分辨產品名稱、盲測資料與樣本限制。',
`For a class project, Bella pours apple juice from one carton into two identical cups. She marks one “New Recipe” and the other “Regular Recipe.” Five classmates taste both without seeing the carton. Three choose the new recipe, one chooses the regular recipe, and one says they taste the same.

After the tasting, Bella reveals that both cups contain the same juice. Her classmates are surprised. She explains that this small activity cannot tell them exactly why each person chose a cup. The label may have influenced a choice, but chance or the order of tasting could also matter.

Next time, Bella plans to use simple letter labels and change which cup people taste first. Her report includes all five responses, including “the same.” She does not claim to have discovered a new, better juice.`,
[['identical','完全相同的','Use two identical cups.'],['recipe','配方；食譜','The label says New Recipe.'],['reveal','揭露','Bella reveals the source of the juice.'],['influence','影響','A label may influence a choice.'],['response','回應','Record every response in the report.']],
[['by chance','偶然；碰巧'],['taste the same','嚐起來相同']], [
q('D','Where does the juice in both cups come from?', ['One carton.','Two different shops.','Five classmates’ bottles.','Two new fruit recipes.'], '兩杯均從同一盒蘋果汁倒出。','Bella pours apple juice from one carton into two identical cups.', ['同一carton。','沒有不同店鋪。','五是參與學生數。','標籤不同不代表配方不同。']),
q('D','How many classmates choose the New Recipe cup?', ['Three.','One.','Four.','Five.'], '三人選new，一人regular，一人一樣。','Three choose the new recipe, one chooses the regular recipe, and one says they taste the same.', ['直接對應three。','一人是其他各組。','四是有選偏好杯的人總數。','五是全部參加者。']),
q('I','Why does Bella avoid saying the label caused every choice?', ['Other explanations are possible in this small activity.','The carton contains no juice.','Everyone chose the same cup.','She forgot which label said New Recipe.'], '她列出偶然、品嚐順序等其他可能，不可單憑小活動斷定。','chance or the order of tasting could also matter.', ['保留多種解釋。','兩杯確實有果汁。','三、一、一並非同選。','沒有遺忘標籤。']),
q('V','What does “reveals” mean here?', ['Makes previously hidden information known.','Pours juice into a new carton.','Refuses to answer a question.','Changes the flavor of a drink.'], '大家不知道同源，Bella告知之後驚訝，reveals指揭露。','After the tasting, Bella reveals that both cups contain the same juice.', ['揭露先前未知的真相。','不是重新倒裝。','她明確告知，不拒答。','沒有改變果汁。']),
q('X','What should a complete results table show?', ['New: 3; Regular: 1; Same: 1.','New: 3; Regular: 2; Same: 0.','New: 5; Regular: 0; Same: 0.','New: 1; Regular: 3; Same: 1.'], '不得把「一樣」併入另一組或省略，應保存全部五份回應。','Her report includes all five responses, including “the same.”', ['與前段三、一、一一致。','錯把一樣併入regular。','錯稱全選new。','new和regular人數反了。']),
q('M','Which conclusion fits the activity best?', ['Different labels accompanied different preferences, but the cause is not settled.','The new juice is proven to be better for every person.','Letter labels will guarantee identical answers next time.','Any answer other than New Recipe should be removed.'], '標籤與選擇一起被觀察到，不代表已證明因果或產品優劣。','She does not claim to have discovered a new, better juice.', ['區分觀察與尚未確定的原因。','同一果汁且小樣本不支持全面優劣。','改設計也不能保證答案一致。','須保留所有反應。'])
]),
lesson(31, 'Order Today, Eat Tomorrow', '判讀預訂、變更、取消與付款規則。',
`SCHOOL LUNCH PREORDERS

Starting next week, students can order a lunch box for the following school day. Choose a rice box or a noodle box through the school form before 9:00 a.m. Each costs $50. An order number appears after you submit the form successfully.

Changes and cancellations are accepted until 10:00 a.m. on the order day. After that, the kitchen uses the list to buy ingredients. Sending another form does not cancel your first order. To change a choice, open the original order number and select “Edit.”

Collect your box at the cafeteria between 12:00 and 12:20 on the delivery day. Pay when you collect it; do not leave money in the classroom.

For a Monday lunch, submit the order on Friday. During this trial, orders are for students only. Teachers continue using their usual lunch service.`,
[['following','接下來的','The lunch is for the following school day.'],['submit','提交','Submit the form before nine.'],['cancel','取消','Use the original order to cancel.'],['ingredient','食材','The kitchen buys ingredients after ten.'],['trial','試辦；試用期','Only students can join the trial.']],
[['pay when','在……時付款'],['the following school day','下一個上課日']], [
q('D','How much does one lunch box cost?', ['$50.','$9.','$10.','$20.'], '兩款每份都是50元。','Each costs $50.', ['直接對應價錢。','9是訂購截止時刻。','10是變更截止時刻。','20是取餐結束的分鐘數。']),
q('D','When should students pay?', ['When collecting the lunch box.','When entering the classroom.','Before they open the form.','After the school term ends.'], '領取餐盒時付錢，不能留錢在教室。','Pay when you collect it; do not leave money in the classroom.', ['符合pay when collect。','沒有到教室付款。','不用開表前付款。','不是學期結束。']),
q('X','A student orders on Friday. Which lunch is the order for?', ['Monday’s lunch.','Friday’s lunch.','Saturday’s lunch.','The following Friday’s lunch.'], '以次一上課日為準，公告特別列出週一在週五訂。','For a Monday lunch, submit the order on Friday.', ['明確規定週五對應週一。','不是當天午餐。','週六未列為上課日。','不需要隔整週。']),
q('V','What does “trial” mean in this notice?', ['A period for trying a new service.','A legal hearing about lunch boxes.','A competition to eat quickly.','A test of students’ cooking skills.'], '餐盒新服務的試行期，不是司法審判。','During this trial, orders are for students only.', ['結合starting next week的新服務。','此處沒有訴訟。','不是比賽。','不是考學生烹調。']),
q('X','At 9:30 on the order day, a student wants to change rice to noodles. What should the student do?', ['Open the original order number and choose Edit.','Send a new form and assume the first order disappears.','Wait until collecting the rice box the next day.','Leave a different amount of money in the classroom.'], '9:30仍在10點前可變更，但不能重送當成取消。','To change a choice, open the original order number and select “Edit.”', ['時間與流程都符合。','新表不取消舊訂單。','超過變更期限。','付款不能取代變更。']),
q('I','Why is the change deadline earlier than the delivery day?', ['The kitchen uses confirmed choices to prepare its purchases.','Students must finish eating before ten.','The boxes have different prices after ten.','Teachers must approve each student’s meal at noon.'], '十點之後依名單採買食材，所以先凍結選項。','After that, the kitchen uses the list to buy ingredients.', ['將截止時間與採買需求連結。','十點不是用餐截止。','沒有調價。','沒有老師逐單批准。'])
]),
lesson(32, 'Boss: The Free-Delivery Question', '整合餐點需求、免運門檻與總預算，避免只看促銷。',
`[Picnic order]
Twelve students are planning lunch together. Four have requested vegetable sandwiches, and eight have requested rice boxes. They need exactly one meal each. Their total budget, including delivery, is $600.

[Shop prices]
Vegetable sandwich: $40 each
Rice box: $50 each
Delivery: $30 per order
Delivery is free when the food subtotal reaches $600. Drinks do not count toward this amount. There are no other fees or discounts.

[Team chat]
Nora: Our twelve meals cost $560 before delivery. We can afford the order.
Ian: What if we add one vegetable sandwich? Then delivery will be free.
Nora: We would pay $40 more for food but save only $30 on delivery. Does anyone need a thirteenth meal?
Ian: No. I was looking only at the word “free.” Let's keep the original order and check the final bill before paying.`,
[['budget','預算','The budget includes delivery.'],['subtotal','小計','The food subtotal is five hundred sixty dollars.'],['reach','達到','The subtotal must reach six hundred dollars.'],['afford','負擔得起','We can afford the original order.'],['original','原先的','Keep the original order of twelve meals.']],
[['count toward','計入'],['before paying','付款之前']], [
q('D','How many rice boxes do the students need?', ['Eight.','Four.','Twelve.','Thirteen.'], '八位指定飯盒，四位指定蔬菜三明治。','Four have requested vegetable sandwiches, and eight have requested rice boxes.', ['八位對應八個飯盒。','四是三明治數。','十二是全部餐點數。','十三是加購後總數。']),
q('D','When is delivery free?', ['When the food subtotal is at least $600.','Whenever twelve meals are ordered.','When food and delivery together cost $600.','Whenever an order includes drinks.'], '免運判準是食物小計達到600，不含運費或飲料。','Delivery is free when the food subtotal reaches $600.', ['正確使用食物小計門檻。','餐點數不是門檻。','運費不能算入食物小計。','飲料不計入門檻。']),
q('X','What is the food subtotal for the requested twelve meals?', ['$560.','$480.','$600.','$590.'], '4×40＋8×50＝160＋400＝560。','Nora: Our twelve meals cost $560 before delivery.', ['四個三明治加八個飯盒為560。','480是假設十二份都40元。','600是加一個三明治後的食物小計。','590含原訂單運費。']),
q('X','How much does the original order cost including delivery?', ['$590.','$560.','$600.','$630.'], '食物560未達免運門檻，所以加30，共590。','Delivery: $30 per order', ['560＋30＝590。','漏加運費。','600是加購一份後總價。','不是先湊600再加運費。']),
q('I','Why does Ian first suggest an extra sandwich?', ['He focuses on removing the delivery charge.','He has received a request from a thirteenth student.','He wants to replace all the rice boxes.','He thinks a sandwich costs less than $30.'], 'Ian承認只注意到免費配送，沒有先比較總費用。','Ian: No. I was looking only at the word “free.”', ['與對免運的注意一致。','他回答沒有多一人需求。','沒有改換飯盒。','價目明列三明治40元。']),
q('M','Which lesson is most strongly supported?', ['Compare the whole cost with the actual need.','Choose the order with the largest number of items.','Treat every extra item as a necessary purchase.','Count delivery charges as part of the food subtotal.'], '除了免運，還要檢查加購成本及是否真的需要。','Does anyone need a thirteenth meal?', ['結合前一句成本比較與本句需求檢查。','人數固定，不是愈多愈好。','加購並非必要。','食物小計不含運費。']),
q('V','What does “afford” mean in Nora’s first message?', ['Have enough money to pay for something.','Receive an order without paying anything.','Deliver meals before they become cold.','Divide food into exactly equal pieces.'], '預算600可支付590，所以afford是負擔得起。','Nora: Our twelve meals cost $560 before delivery. We can afford the order.', ['金額在預算內，能夠支付。','仍須付款。','不是配送速度。','不是分切食物。']),
q('X','How would one extra vegetable sandwich change the final cost?', ['It would rise by $10, from $590 to $600.','It would fall by $30, from $590 to $560.','It would stay at $590 because delivery is free.','It would rise by $40, from $590 to $630.'], '新食物小計600且免運；原總價590，所以增加10。','We would pay $40 more for food but save only $30 on delivery.', ['40−30＝10；590＋10＝600。','只算省運費，漏加購成本。','加購大於省下運費。','漏扣原來30元運費。']),
q('X','Which statement compares the two choices correctly?', ['The original order meets all requests and leaves $10; the extra-item order leaves $0.','Both orders meet the requests and leave $30 each.','Only the extra-item order can stay within the $600 budget.','The original order needs one fewer rice box to fit the budget.'], '原單590留10，追加單600留0；原單已滿足十二份指定需求。','Their total budget, including delivery, is $600.', ['結合需求、預算與兩種總價。','餘額各為10與0，並非30。','590也在預算內。','原單已不超支，不必刪飯盒。'])
]),
lesson(33, 'The Recipe Card Repair', '在新情境中複習份量、食材、確認與價格用語。',
`For Sunday review, Tess makes a pretend café menu for her younger cousin. She writes five words on separate cards: portion, cost, confirm, recipe, and ingredient. Her cousin must match each word to a short situation.

One situation shows a list of steps for making soup. He selects ingredient because he sees vegetables in the picture. Tess asks him to read the words beside the picture. The clue describes the whole set of instructions, so he changes his choice to recipe.

Next, a server asks a customer to repeat an order before sending it to the kitchen. Her cousin chooses confirm and explains that the server is checking the details.

Before finishing, they write a new clue for portion without drawing any food. Tomorrow, Tess will hide the five cards and ask him to supply the words himself. Pictures can help, but the written clues still matter.`,
[['portion','一份的量','Each portion fills one small bowl.'],['cost','花費；價格為','The meal costs fifty dollars.'],['confirm','確認','Confirm the order before sending it.'],['recipe','食譜；製作方法','Follow the steps in the recipe.'],['ingredient','食材','Carrots are one ingredient in the soup.']],
[['match A to B','將A與B配對'],['a set of instructions','一套指示']], [
q('D','How many word cards does Tess prepare?', ['Five.','Two.','Four.','Six.'], '列出五個詞，各寫一張卡。','She writes five words on separate cards: portion, cost, confirm, recipe, and ingredient.', ['原文明說five。','兩個是本篇詳述的情境數，不是卡數。','不是四張。','沒有第六個詞。']),
q('I','Why does the cousin first choose ingredient?', ['He relies on the vegetables in the picture.','He has already read every written step carefully.','Tess has told him that recipe is never useful.','The situation asks for the price of the soup.'], '第一次依圖中的蔬菜猜，忽略線索指整份製作步驟。','He selects ingredient because he sees vegetables in the picture.', ['because直接說明理由。','後來才被要求重讀文字。','Tess沒有排除recipe。','情境是做湯步驟，不是價格。']),
q('D','Which action represents confirm in the second situation?', ['Checking an order by asking the customer to repeat it.','Choosing a vegetable from a picture.','Writing the total price on a bill.','Putting an equal amount of soup in each bowl.'], '請顧客複述以查核訂單，對應confirm。','a server asks a customer to repeat an order before sending it to the kitchen.', ['重複核對細節。','這是選食材的線索。','這較接近cost。','這較接近portion。']),
q('V','What does “supply” mean near the end?', ['Provide the missing words from memory.','Deliver soup to the café tables.','Pay for the cards before leaving.','Draw vegetables beside every answer.'], '藏起詞卡再請他補出單字，supply是提供所缺答案。','ask him to supply the words himself.', ['語境是自行說出或寫出詞。','不是實際送湯。','不是購買卡片。','新線索刻意不用食物圖。']),
q('I','Why will Tess hide the cards tomorrow?', ['To check whether her cousin can recall words without seeing choices.','To prevent her cousin from ever using the words again.','To make the soup recipe shorter.','To remove every written clue from the activity.'], '不看選項自行填詞，檢查是否真能回想。','Tomorrow, Tess will hide the five cards and ask him to supply the words himself.', ['由選詞配對進到主動回想。','目的是再次使用詞彙。','沒有修改食譜。','藏的是詞卡，不是所有情境線索。']),
q('M','What is the best summary of this review?', ['Use written evidence, explain choices, and practise recalling words.','Trust a picture even when the written clue says something different.','Learn only words that name visible vegetables.','Keep the answer cards visible in every future exercise.'], '先辨認文字線索、說明理由，再隔天遮答案回想。','Pictures can help, but the written clues still matter.', ['涵蓋全文三個步驟。','文中正示範修正單靠圖片的判斷。','五詞並非全是蔬菜名稱。','最後安排藏起卡片。'])
]),
lesson(34, 'A Sign at the Wrong Gate', '整合位置、封閉通知與替代路線。',
`On Monday, Owen volunteers to welcome visitors to the school book show. The show is in the library, beside the east gate. A small printed map tells visitors to enter through the north gate and follow the covered path.

Before the show opens, workers close the north gate to repair its steps. Owen puts a sign on the closed gate: “Please use the east gate beside the library.” However, visitors arriving at the bus stop still follow the old maps toward the north gate.

His teacher asks where people first decide which way to walk. Owen returns to the bus stop and places an updated direction sign beside the map board. He also tells the welcome team about the change.

Now visitors learn about the closure before choosing a route. Owen keeps the sign at the north gate too, for anyone coming from another direction.`,
[['volunteer','自願幫忙','Owen volunteers at the book show.'],['visitor','訪客','Visitors need a clear direction sign.'],['repair','修理','Workers repair the steps.'],['direction','方向','Check the direction before walking.'],['route','路線','Choose the open route to the library.']],
[['beside the east gate','在東門旁'],['from another direction','從另一個方向']], [
q('D','Where is the book show?', ['In the library beside the east gate.','At the bus stop beside the map board.','On the steps outside the north gate.','In a classroom along the covered path.'], '書展在東門旁的圖書館。','The show is in the library, beside the east gate.', ['地點與相對位置都吻合。','公車站是旅程起點。','北門台階正維修。','沒有說書展在教室。']),
q('D','Why is the north gate closed?', ['Workers are repairing its steps.','All the books have been moved outside.','The bus stop has changed its name.','The show has already ended.'], '北門因台階維修而關閉。','workers close the north gate to repair its steps.', ['to repair說明原因。','沒有移出書本。','沒有更名。','當時書展尚未開始。']),
q('I','Why do visitors still head toward the north gate at first?', ['Their old maps still give the original route.','Owen’s new sign tells them to use the closed steps.','The east gate is closed for the same repair.','They have been asked to help the workers.'], '公車站出發的人依舊依循舊地圖，未先看到北門上的新訊息。','visitors arriving at the bus stop still follow the old maps toward the north gate.', ['舊資訊仍引導他們。','新牌指定東門。','未說東門關閉。','訪客來看書展，不是修階梯。']),
q('V','What does “closure” refer to in the last paragraph?', ['The north gate being temporarily unavailable.','The library finishing its book orders.','The bus stop moving to a new street.','The map board becoming larger.'], '前文北門封閉維修，closure指該門關閉狀態。','Now visitors learn about the closure before choosing a route.', ['指北門不能通行。','沒有圖書採購。','公車站沒有搬遷。','看板大小沒變。']),
q('X','Which pair of signs does Owen leave in place at the end?', ['One at the bus stop and one at the north gate.','One inside each classroom along the path.','One at the east gate and one inside the library.','One on the repair tools and one on every book.'], '他在公車站新增，同時保留北門的告示。','Owen keeps the sign at the north gate too, for anyone coming from another direction.', ['加上前段bus stop的新牌，合共兩處。','沒有逐教室設牌。','東門與館內不是所述設牌處。','沒有在工具書本上放牌。']),
q('M','Which principle does Owen’s change illustrate?', ['Put important route updates where people make their first choice.','Give directions only after visitors reach a closed entrance.','Remove every old sign even if some visitors still need it.','Assume that all visitors arrive from the same direction.'], '老師指出決定方向的位置，他把更新前移到公車站，同時保留另一入口提醒。','His teacher asks where people first decide which way to walk.', ['涵蓋更新地點及其作用。','這是最初不夠有效的做法。','北門牌仍保留。','結尾考慮別的來向。'])
]),
lesson(35, 'The Ticket for Two Rides', '依實際搭乘次數比較票價，分辨確定與可能行程。',
`On Tuesday, Hana and her father visit a nearby town. At the bus station, Hana compares two tickets for her own travel. A single ticket costs $40 and covers one ride. A day pass costs $90 and covers any number of rides until the last bus that evening. Tickets cannot be refunded.

Her plan has two rides: from the station to the museum, and from the museum back to the station. She may also visit a riverside market, but she has not decided. That stop would require one additional ride.

Hana buys a single ticket for the first ride. At the museum, rain begins, and she decides not to visit the market. She buys another single ticket for the return journey.

She spends $80 altogether. A day pass would have cost less for three rides, but not for the two she actually takes.`,
[['compare','比較','Compare the two ticket prices.'],['cover','涵蓋；包含','One ticket covers one ride.'],['refund','退款','The ticket cannot be refunded.'],['additional','額外的','The market requires one additional ride.'],['journey','旅程','The return journey takes twenty minutes.']],
[['any number of','任意次數的'],['return journey','回程']], [
q('D','How much is a day pass?', ['$90.','$40.','$80.','$120.'], '一日票90元。','A day pass costs $90 and covers any number of rides until the last bus that evening.', ['原文90元。','40是一張單次票。','80是兩次票總額。','120是三張單次票。']),
q('D','Why does Hana skip the riverside market?', ['Rain begins while she is at the museum.','The day pass has already been refunded.','The station has closed before noon.','Her father has used her second ticket.'], '在博物館開始下雨，她因此不去市集。','At the museum, rain begins, and she decides not to visit the market.', ['依事件順序可讀出原因。','她買的是單次票且不可退。','沒有車站提早關門。','沒有父親用票。']),
q('X','What is Hana’s total spending on bus tickets?', ['$80.','$40.','$90.','$130.'], '兩張單次票，各40，共80。','She spends $80 altogether.', ['2×40＝80。','漏了回程票。','這是一日票價。','不是一日票再加單次票。']),
q('V','What does “additional” mean in the second paragraph?', ['Extra, beyond the two planned rides.','Free, with no ticket needed.','Earlier than every other ride.','Shorter than the return journey.'], '市集站要在原先兩趟之外再加一趟。','That stop would require one additional ride.', ['表示新增一趟。','仍需買票，不代表免費。','沒有指定比較早。','沒有比較車程長短。']),
q('X','If Hana had taken three rides that day, how much would a day pass have saved compared with three single tickets?', ['$30.','$10.','$40.','$50.'], '三張單次票120，一日票90，差30元。','A single ticket costs $40 and covers one ride.', ['3×40−90＝30。','10是兩次票與一日票的價差。','40只是一張單次票價。','50是90與一張40的差，不是三次比較。']),
q('I','Which statement is supported by the final comparison?', ['The cheaper choice depends on how many rides are actually taken.','A day pass is always cheaper, even for one ride.','Single tickets are always cheaper, even for three rides.','An undecided stop must be counted as a completed journey.'], '兩趟單次較便宜、三趟一日票較便宜，須配合實際次數。','A day pass would have cost less for three rides, but not for the two she actually takes.', ['同時符合兩種次數的比較。','一趟40小於90。','三趟120大於90。','可能行程不等於實際搭乘。'])
]),
];
