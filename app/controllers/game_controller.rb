class GameController < ApplicationController

  def index
    #Using rails sessions to store the array of cards for dealer, player and overall
    session[:all_cards] = get_cards
    session[:player_cards] = []
    session[:dealer_cards] = []
  end

  #Finds the next random card to deal
  def get_next_card
    if params[:type]
      num_of_cards = session[:all_cards].size - 1
      random_num = rand(0..num_of_cards)

      #Ensures a previously dealt card is not dealt again
      while( session[:all_cards][random_num].to_i==0 )
        random_num = rand(0..num_of_cards)
      end

      selected = session[:all_cards][random_num]
      session[:all_cards][random_num] = 0
      session[:player_cards] << selected if params[:type].to_s=="player"
      session[:dealer_cards] << selected if params[:type].to_s=="dealer"
      @status = :ok
    else
      selected = nil
      @status = :failed 
    end
    respond_to do |format|
      format.json { render :json => {:status => @status, :selected => selected} }
    end
  end

  #checks the result based on pre-defined rules to determine whether someone has won or not
  def check_results
    if params[:type]
      if params[:type].to_s=="player"
        game_over, winner = get_player_results
      elsif params[:type].to_s=="dealer"
        game_over, winner = get_dealer_results
      else
        game_over, winner = false, nil
      end
    else
      game_over, winner = false, nil
    end
    respond_to do |format|
      format.json { render :json => {:game_over => game_over, :winner => winner } }
    end
  end

  private

    #This method generates the scores array of all cards based on the 6 deck of cards
    def get_cards
      cards = []
      index = 0
      [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11].each do |num|
        24.times do
          cards[index] = num
          index += 1
        end
      end
      shuffle(cards)
    end

    #Shuffles the cards to ensure randomness
    def shuffle(cards)
      cards.size.times do 
        rand1, rand2, rand3 = get_rand(cards.size-1)
        temp = cards[rand1]
        cards[rand1] = cards[rand2]
        cards[rand2] = cards[rand3]
        cards[rand3] = temp
      end
      cards
    end

    def get_rand(num)
      [rand(0..num), rand(0..num), rand(0..num)]
    end

    def get_player_results
      player_sum = session[:player_cards].inject(&:+).to_i
      if player_sum==21
        return [true, "player"]
      elsif player_sum > 21
        return [true, "dealer"]
      else
        return [false, nil]
      end
    end 

    def get_dealer_results
      dealer_sum = session[:dealer_cards].inject(&:+).to_i
      player_sum = session[:player_cards].inject(&:+).to_i

      if dealer_sum==21
        return [true, "dealer"]
      elsif dealer_sum > 21
        return [true, "player"]
      elsif dealer_sum >= 17
        winner = dealer_sum > player_sum ? "dealer" : "player"
        winner = dealer_sum == player_sum ? "draw" : winner
        return [true, winner]
      else
        return [false, nil] 
      end
    end
end